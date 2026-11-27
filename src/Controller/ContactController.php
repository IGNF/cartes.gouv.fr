<?php

namespace App\Controller;

use App\Dto\Contact\ContactUsDTO;
use App\Exception\AppException;
use App\Security\User;
use App\Services\GeocaptchaService;
use App\Services\MailerService;
use App\Services\MembershipService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\AutowireServiceClosure;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Lock\Exception\ExceptionInterface as LockException;
use Symfony\Component\Lock\LockFactory;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Exception\ExceptionInterface as SerializerExceptionInterface;
use Symfony\Component\Serializer\Normalizer\DenormalizerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route(
    '/api/contact',
    name: 'cartesgouvfr_api_contact_',
    options: ['expose' => true],
)]
class ContactController extends AbstractController
{
    public function __construct(
        private readonly MailerService $mailerService,
        private readonly LoggerInterface $logger,
        /** @var \Closure(): LockFactory résolu à l'usage : le formulaire fonctionne sans le stockage des verrous */
        #[AutowireServiceClosure('lock.factory')]
        private readonly \Closure $lockFactory,
    ) {
    }

    #[Route(
        '/contact-us',
        name: 'contact_us',
        methods: ['POST'])]
    public function contact(Request $request, RateLimiterFactory $contactUsLimiter, DenormalizerInterface $serializer, ValidatorInterface $validator, GeocaptchaService $geocaptchaService): JsonResponse
    {
        // avant tout contrôle : les appels de robots comptent aussi ; verrou commun, le compteur reste par adresse IP
        try {
            $lock = ($this->lockFactory)()->createLock('contact_us_limiter');
            $lock->acquire(true);
        } catch (LockException) {
            // stockage des verrous indisponible : le formulaire reste ouvert, la limite s'applique sans verrou
            $lock = null;
        }
        try {
            $limit = $contactUsLimiter->create($request->getClientIp())->consume();
        } finally {
            try {
                $lock?->release();
            } catch (LockException) {
            }
        }
        if (!$limit->isAccepted()) {
            throw new AppException('Trop de demandes, réessayez plus tard', Response::HTTP_TOO_MANY_REQUESTS, headers: ['Retry-After' => (string) max(1, $limit->getRetryAfter()->getTimestamp() - time())]);
        }

        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            throw new BadRequestHttpException('Le formulaire de contact est incomplet');
        }

        // utilisateur est un bot si la condtion suivante est vraie
        if ('0' !== ($data['importance'] ?? null)) {
            return new JsonResponse();
        }

        try {
            $contact = $serializer->denormalize($data, ContactUsDTO::class);
        } catch (SerializerExceptionInterface) {
            throw new BadRequestHttpException('Le formulaire de contact est incomplet');
        }

        $violations = $validator->validate($contact);
        if (count($violations) > 0) {
            throw new BadRequestHttpException((string) $violations->get(0)->getMessage());
        }

        $geocaptchaService->check($contact->geocaptchaToken);

        if ($this->mailerService->containsBannedWords($contact->message)) {
            throw new BadRequestHttpException('Votre message contient des mots interdits');
        }

        // signalements de contenu : adresse dédiée, hors support
        [$recipient, $subject] = match ($contact->request_type) {
            ContactUsDTO::REQUEST_TYPE_ILLEGAL_CONTENT => [$this->getParameter('legal_contact_mail'), '[cartes.gouv.fr] Signalement de contenu illicite'],
            ContactUsDTO::REQUEST_TYPE_CONTENT_REMOVAL_CLAIM => [$this->getParameter('legal_contact_mail'), '[cartes.gouv.fr] Réclamation suite à suppression de contenu'],
            default => [$this->getParameter('support_contact_mail'), '[cartes.gouv.fr] Nouvelle demande'],
        };
        $now = new \DateTime();

        $supportMailParams = [
            'userEmail' => $contact->email_contact,
            'firstName' => $contact->first_name,
            'lastName' => $contact->last_name,
            'category' => $contact->category,
            'organization' => $contact->organization,
            'requestType' => $contact->request_type,
            'sendDate' => $now,
            'message' => $contact->message,
        ];

        if ($user instanceof User) {
            $supportMailParams['userId'] = $user->getId();
        }

        $this->logger->info('contact.request', [
            'endpoint' => 'contact_us',
            'is_authenticated' => $user instanceof User,
        ]);

        $this->mailerService->sendMail($recipient, $subject, 'Mailer/contact.html.twig', $supportMailParams);

        // // envoi du mail d'accusé de réception à l'utilisateur
        $this->mailerService->sendMail($contact->email_contact, '[cartes.gouv.fr] Accusé de réception de votre demande', 'Mailer/contact_acknowledgement.html.twig', [
            'message' => $contact->message,
            'sendDate' => $now,
        ]);

        return new JsonResponse(['success' => true]);
    }

    #[Route(
        '/datastore-create-request',
        name: 'datastore_create_request',
        methods: ['POST'])]
    public function datastoreCreateRequest(Request $request, MembershipService $membershipService): JsonResponse
    {
        $user = $this->getUser();

        $supervisor = [];   // Liste des community dont l'utilisateur courant est "supervisor"
        $member = [];       // Liste des community dont l'utilisateur courant est simple membre
        if ($user instanceof User) {
            foreach ($membershipService->currentProfile()['communities_member'] ?? [] as $communityMember) {
                $community = $communityMember['community'];
                if ($user->getId() === $community['supervisor']) {
                    $supervisor[$community['name']] = $community['_id'];
                } else {
                    $member[$community['name']] = $community['_id'];
                }
            }
        }

        $data = json_decode($request->getContent(), true);

        $supportAddress = $this->getParameter('support_contact_mail');
        $now = new \DateTime();

        $mailParams = [
            'sendDate' => $now,
            'supervisor' => $supervisor,
            'member' => $member,
            'data' => $data,
        ];

        $userEmail = $this->connectedUserEmail($user);

        $this->logger->info('datastore.creation.request', [
            'endpoint' => 'datastore_create_request',
            'is_authenticated' => $user instanceof User,
        ]);

        // Envoi du mail à l'adresse du support
        $this->mailerService->sendMail($supportAddress, "[cartes.gouv.fr] Demande de création d'un entrepôt", 'Mailer/datastore_create_request.html.twig', $mailParams);

        // Envoi du mail d'accusé de réception à l'utilisateur
        $this->mailerService->sendMail($userEmail, '[cartes.gouv.fr] Accusé de réception de votre demande', 'Mailer/datastore_create_request_acknowledgement.html.twig',
            $mailParams
        );

        return new JsonResponse(['success' => true]);
    }

    #[Route(
        '/join-community',
        name: 'join_community',
        methods: ['POST'])]
    public function joinCommunity(Request $request): JsonResponse
    {
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        $now = new \DateTime();

        $userEmail = $this->connectedUserEmail($user);

        $mailParams = [
            'sendDate' => $now,
            'community' => $data['community'],
        ];

        if (isset($data['other_info'])) {
            $mailParams['other_info'] = $data['other_info'];
        }

        $this->logger->info('community.join.request', [
            'endpoint' => 'join_community',
            'is_authenticated' => $user instanceof User,
        ]);

        // Envoi du mail à l'adresse de contact de la communauté
        $this->mailerService->sendMail(
            $data['community']['contact'],
            sprintf('[cartes.gouv.fr] Demande pour rejoindre %s', $data['community']['name']),
            'Mailer/join_community.html.twig',
            $mailParams
        );

        // Envoi du mail d'accusé de réception à l'utilisateur
        $this->mailerService->sendMail(
            $userEmail,
            '[cartes.gouv.fr] Accusé de réception de votre demande',
            'Mailer/join_community_acknowledgement.html.twig',
            $mailParams
        );

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route(
        '/accesses-request',
        name: 'accesses_request',
        methods: ['POST'],
    )]
    public function accessesRequest(Request $request): JsonResponse
    {
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);
        $catalogueUrl = $this->getParameter('catalogue_url');
        $catalogueDatasheetUrl = rtrim($catalogueUrl, '/').'/dataset/'.$data['file_identifier'];

        $now = new \DateTime();

        $userEmail = $this->connectedUserEmail($user);

        $mailParams = [
            'sendDate' => $now,
            'catalogueDatasheetUrl' => $catalogueDatasheetUrl,
            'layers' => $data['layers'],
        ];
        if (isset($data['myself'])) {
            $mailParams['myself'] = true;
        }
        if (isset($data['beneficiaries'])) {
            $mailParams['beneficiaries'] = $data['beneficiaries'];
        }
        if (isset($data['message'])) {
            $mailParams['message'] = $data['message'];
        }

        $this->logger->info('access.restricted.request', [
            'endpoint' => 'accesses_request',
            'is_authenticated' => $user instanceof User,
            'layer_count' => count($data['layers'] ?? []),
        ]);

        // Envoi du mail à l'adresse de contact des données
        $this->mailerService->sendMail(
            $data['email_contact'],
            "[cartes.gouv.fr] Demande d'accès à des services de diffusion restreints",
            'Mailer/accesses_request.html.twig',
            $mailParams
        );

        // Envoi du mail d'accusé de réception à l'utilisateur
        $this->mailerService->sendMail(
            $userEmail,
            '[cartes.gouv.fr] Accusé de réception de votre demande',
            'Mailer/accesses_request_acknowledgement.html.twig',
            $mailParams
        );

        return new JsonResponse(['state' => 'success']);
    }

    #[Route(
        '/datastore-deletion-request',
        name: 'datastore_deletion_request',
        methods: ['POST'],
    )]
    public function datastoreDeletionRequest(Request $request, MembershipService $membershipService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $datastoreIdentity = $membershipService->getDatastoreIdentity($data['datastoreId']);

        $supportAddress = $this->getParameter('support_contact_mail');
        $now = new \DateTime();
        $user = $this->getUser();
        $userEmail = $this->connectedUserEmail($user);

        $mailParams = [
            'sendDate' => $now,
            'data' => $data,
            'datastore_name' => $datastoreIdentity->name,
            'datastore_id' => $data['datastoreId'],
            'community_id' => $datastoreIdentity->communityId,
        ];

        $this->logger->info('datastore.deletion.request', [
            'endpoint' => 'datastore_deletion_request',
            'is_authenticated' => $user instanceof User,
        ]);

        // Envoi du mail à l'adresse du support
        $this->mailerService->sendMail($supportAddress, sprintf("[cartes.gouv.fr] Demande de suppression de l'entrepôt %s", $datastoreIdentity->name), 'Mailer/datastore_delete_request/request.html.twig', $mailParams);

        // Envoi du mail d'accusé de réception à l'utilisateur
        $this->mailerService->sendMail($userEmail, '[cartes.gouv.fr] Accusé de réception de votre demande', 'Mailer/datastore_delete_request/request_acknowledgement.html.twig',
            $mailParams
        );

        return new JsonResponse(['state' => 'success']);
    }

    // routes sous /api/contact : le pare-feu exige un utilisateur connecté
    private function connectedUserEmail(?UserInterface $user): string
    {
        assert($user instanceof User);

        return $user->getEmail();
    }
}
