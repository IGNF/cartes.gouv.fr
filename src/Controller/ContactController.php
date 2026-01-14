<?php

namespace App\Controller;

use App\Exception\AppException;
use App\Security\User;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\EntrepotApi\UserApiService;
use App\Services\MailerService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    name: 'cartesgouvfr_contact_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()',
)]
class ContactController extends AbstractController
{
    public function __construct(
        private UserApiService $userApiService,
        private MailerService $mailerService,
        private LoggerInterface $mailerLogger,
    ) {
    }

    #[Route(
        '/contact_us',
        name: 'contact_us',
        options: ['expose' => true],
        methods: ['POST'],
        condition: 'request.isXmlHttpRequest()'
    )]
    public function contact(Request $request): JsonResponse
    {
        /** @var User */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        try {
            // Validite de l'email
            $userEmail = $data['email_contact'];
            if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
                throw new BadRequestHttpException("L'adresse mail n'est pas valide");
            }

            // utilisateur est un bot si la condtion suivante est vraie
            if ('0' !== $data['importance']) {
                return new JsonResponse();
            }

            $message = $data['message'];
            if ($this->mailerService->containsBannedWords($message)) {
                throw new BadRequestHttpException('Votre message contient des mots interdits');
            }

            $supportAddress = $this->getParameter('support_contact_mail');
            $now = new \DateTime();

            $userApi = null;
            $supportMailParams = [
                'userEmail' => $userEmail,
                'firstName' => $data['first_name'],
                'lastName' => $data['last_name'],
                'category' => $data['category'],
                'organization' => $data['organization'],
                'sendDate' => $now,
                'message' => $message,
            ];

            if ($user instanceof User) {
                $userApi = $this->userApiService->getMe();
                $supportMailParams['userId'] = $userApi['_id'];
            }

            $this->mailerLogger->info('User ({userEmail}) : {message}', [
                'userEmail' => $userEmail,
                'message' => $message,
            ]);

            // envoi du mail à l'adresse du support
            $this->mailerService->sendMail($supportAddress, '[cartes.gouv.fr] Nouvelle demande', 'Mailer/contact.html.twig', $supportMailParams);

            // // envoi du mail d'accusé de réception à l'utilisateur
            $this->mailerService->sendMail($userEmail, '[cartes.gouv.fr] Accusé de réception de votre demande', 'Mailer/contact_acknowledgement.html.twig', [
                'message' => $message,
                'sendDate' => $now,
            ]);

            return new JsonResponse(['success' => true]);
        } catch (BadRequestHttpException|AppException $e) {
            return new JsonResponse(['error' => $e->getMessage()], $e->getStatusCode());
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route(
        '/datastore_create_request',
        name: 'datastore_create_request',
        options: ['expose' => true],
        methods: ['POST'],
        condition: 'request.isXmlHttpRequest()'
    )]
    public function datastoreCreateRequest(Request $request): JsonResponse
    {
        /** @var User */
        $user = $this->getUser();

        $supervisor = [];   // Liste des community dont l'utilisateur courant est "supervisor"
        $member = [];       // Liste des community dont l'utilisateur courant est simple membre
        if ($user instanceof User) {
            $userApi = $this->userApiService->getMe();
            foreach ($userApi['communities_member'] as $communityMember) {
                $community = $communityMember['community'];
                if ($userApi['_id'] === $community['supervisor']) {
                    $supervisor[$community['name']] = $community['_id'];
                } else {
                    $member[$community['name']] = $community['_id'];
                }
            }
        }

        $data = json_decode($request->getContent(), true);

        try {
            $supportAddress = $this->getParameter('support_contact_mail');
            $now = new \DateTime();

            $mailParams = [
                'sendDate' => $now,
                'supervisor' => $supervisor,
                'member' => $member,
                'data' => $data,
            ];

            $userEmail = $user->getEmail();

            $this->mailerLogger->info("User ({userEmail}) : Demande de création d'un entrepôt", [
                'userEmail' => $userEmail,
            ]);

            // Envoi du mail à l'adresse du support
            $this->mailerService->sendMail($supportAddress, "[cartes.gouv.fr] Demande de création d'un entrepôt", 'Mailer/datastore_create_request.html.twig', $mailParams);

            // Envoi du mail d'accusé de réception à l'utilisateur
            $this->mailerService->sendMail($userEmail, '[cartes.gouv.fr] Accusé de réception de votre demande', 'Mailer/datastore_create_request_acknowledgement.html.twig',
                $mailParams
            );

            return new JsonResponse(['success' => true]);
        } catch (BadRequestHttpException|AppException $e) {
            return new JsonResponse(['error' => $e->getMessage()], $e->getStatusCode());
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route(
        '/join_community',
        name: 'join_community',
        options: ['expose' => true],
        methods: ['POST'],
        condition: 'request.isXmlHttpRequest()'
    )]
    public function joinCommunity(Request $request): JsonResponse
    {
        /** @var User */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        try {
            $now = new \DateTime();

            $userEmail = $user->getEmail();

            $mailParams = [
                'sendDate' => $now,
                'community' => $data['community'],
                'message' => $data['message'],
            ];

            $this->mailerLogger->info(sprintf('User (%s) : Demande pour rejoindre %s', $userEmail, $data['community']['name']), [
                'userEmail' => $userEmail,
                'community' => $data['community'],
                'message' => $data['message'],
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
        } catch (BadRequestHttpException|AppException $e) {
            return new JsonResponse(['error' => $e->getMessage()], $e->getStatusCode());
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route(
        '/accesses_request',
        name: 'accesses_request',
        methods: ['POST'],
    )]
    public function accessesRequest(Request $request): JsonResponse
    {
        /** @var User */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);
        $catalogueUrl = $this->getParameter('catalogue_url');
        $catalogueDatasheetUrl = rtrim($catalogueUrl, '/').'/dataset/'.$data['file_identifier'];

        try {
            $now = new \DateTime();

            $userEmail = $user->getEmail();

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

            $context = array_merge(['userEmail' => $userEmail], $mailParams);
            $this->mailerLogger->info('User ({userEmail}) : Demande d\'accès à des services de diffusion de données dont l\'accès est restreint', $context);

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
        } catch (BadRequestHttpException|AppException $e) {
            return new JsonResponse(['state' => 'error', 'message' => $e->getMessage()], $e->getStatusCode());
        } catch (\Exception $e) {
            return new JsonResponse(['state' => 'error', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route(
        '/datastore_deletion_request',
        name: 'datastore_deletion_request',
        methods: ['POST'],
    )]
    public function datastoreDeletionRequest(Request $request, DatastoreApiService $datastoreApiService): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $datastore = $datastoreApiService->get($data['datastoreId']);

            $supportAddress = $this->getParameter('support_contact_mail');
            $now = new \DateTime();
            /** @var User */
            $user = $this->getUser();
            $userEmail = $user->getEmail();

            $mailParams = [
                'sendDate' => $now,
                'data' => $data,
                'datastore_name' => $datastore['name'],
                'datastore_id' => $datastore['_id'],
                'community_id' => $datastore['community']['_id'],
            ];

            $this->mailerLogger->info(sprintf("User (%s) : Demande de suppression de l'entrepôt %s", $userEmail, $datastore['name']), [
                'userEmail' => $userEmail,
            ]);

            // Envoi du mail à l'adresse du support
            $this->mailerService->sendMail($supportAddress, sprintf("[cartes.gouv.fr] Demande de suppression de l'entrepôt %s", $datastore['name']), 'Mailer/datastore_delete_request/request.html.twig', $mailParams);

            // Envoi du mail d'accusé de réception à l'utilisateur
            $this->mailerService->sendMail($userEmail, '[cartes.gouv.fr] Accusé de réception de votre demande', 'Mailer/datastore_delete_request/request_acknowledgement.html.twig',
                $mailParams
            );

            return new JsonResponse(['state' => 'success']);
        } catch (BadRequestHttpException|AppException $e) {
            return new JsonResponse(['state' => 'error', 'message' => $e->getMessage()], $e->getStatusCode());
        } catch (\Exception $e) {
            return new JsonResponse(['state' => 'error', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
