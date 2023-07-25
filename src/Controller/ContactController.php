<?php

namespace App\Controller;

use App\Security\User;
use App\Services\EntrepotApi\UserApiService;
use App\Services\MailerService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    name: 'cartesgouvfr_contact_',
)]
class ContactController extends AbstractController
{
    public function __construct(
        private UserApiService $userApiService
    ) {
    }

    #[Route(
        '/contact_us',
        name: 'contact_us',
        options: ['expose' => true],
        methods: ['POST'],
        condition: 'request.isXmlHttpRequest()'
    )]
    public function contact(Request $request, MailerService $mailerService, LoggerInterface $mailerLogger): JsonResponse
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
            if ($mailerService->containsBannedWords($message)) {
                throw new BadRequestHttpException('Votre message contient des mots interdits');
            }

            // $supportAddress = $this->getParameter('support_contact_mail');
            $now = new \DateTime();

            $userApi = null;
            $supportMailParams = [
                'userEmail' => $userEmail,
                'firstName' => $data['first_name'],
                'lastName' => $data['last_name'],
                'sendDate' => $now,
                'message' => $message,
            ];

            if ($user instanceof User) {
                $userApi = $this->userApiService->getMe();
                $supportMailParams['userId'] = $userApi['_id'];
            }

            $mailerLogger->info('User ({userEmail}) : {message}', [
                'userEmail' => $userEmail,
                'message' => $message,
            ]);

            // TODO : envoi de mail désactivé en attendant d'avoir l'adresse du serveur smtp en production
            // envoi du mail à l'adresse du support
            // $mailerService->sendMail($supportAddress, '[Géoplateforme] Demande de contact', 'Mailer/contact.html.twig', $supportMailParams);

            // // envoi du mail d'accusé de réception à l'utilisateur
            // $mailerService->sendMail($userEmail, '[Géoplateforme] Accusé de réception de votre demande', 'Mailer/contact_acknowledgement.html.twig', [
            //     'message' => $message,
            //     'sendDate' => $now,
            // ]);

            return new JsonResponse(['success' => true]);
        } catch (BadRequestHttpException $e) {
            return new JsonResponse(['error' => $e->getMessage()], $e->getStatusCode());
        }
    }
}
