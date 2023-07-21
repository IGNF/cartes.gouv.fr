<?php

namespace App\Controller;

use App\Security\User;
use Psr\Log\LoggerInterface;
use App\Services\MailerService;
use App\Services\EntrepotApi\UserApiService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

#[Route(
    name: 'cartesgouvfr_contact_',
)]
class ContactController extends AbstractController
{
    public function __construct(
        private UserApiService $userApiService
    ) {}

    #[Route(
        '/contact_us',
        name: 'contact_us',
        options: ['expose' => true],
        methods: ['POST'],
        condition: 'request.isXmlHttpRequest()'
    )]
    public function contact(Request $request, MailerService $mailerService, LoggerInterface $mailerLogger): JsonResponse
    {
        $user = $this->getUser();
        
        $data = json_decode($request->getContent(), true);

        try {
            // Validite de l'email
            $userEmail = $data['email_contact'];
            if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
                throw new BadRequestHttpException('Email is not valid.');
            }

            if ($data['importance'] !== "0") {
                return new JsonResponse();
            }

            $message = $data['message'];
            if ($mailerService->containsBannedWords($message)) {
                throw new BadRequestHttpException('Message contains banned words.');
            }

            $supportAddress = $this->getParameter('support_contact_mail');
            $now = new \DateTime();

            $userApi = null;
            $supportMailParams = [
                'userEmail' => $userEmail,
                'firstName' => $data['first_name'],
                'lastName' => $data['last_name'],
                'sendDate' => $now,
                'message' => $message
            ];

            if ($user instanceof User) {
                $userApi = $this->userApiService->getMe();
                $supportMailParams['userId'] = $userApi['_id'];
            }

            $mailerLogger->info('User ({userEmail}) : {message}', [
                'userEmail' => $userEmail,
                'message' => $message
            ]);

            // sending mail to support address
            $mailerService->sendMail($supportAddress, '[Géoplateforme] Demande de contact', 'Mailer/contact.html.twig', $supportMailParams);

            // sending acknowledgement mail to user
            $mailerService->sendMail($userEmail, '[Géoplateforme] Accusé de réception de votre demande', 'Mailer/contact_acknowledgement.html.twig', [
                'message' => $message,
                'sendDate' => $now,
            ]);

            return new JsonResponse();
        } catch(BadRequestHttpException | \Exception $e) {
            return new JsonResponse($e->getMessage(), Response::HTTP_BAD_REQUEST);
        }    
    }
}