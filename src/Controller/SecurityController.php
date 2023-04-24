<?php

namespace App\Controller;

use App\Security\User;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\Provider\KeycloakClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class SecurityController extends AbstractController
{
    #[Route('/login', name: 'cartesgouvfr_security_login', methods: ['GET'], options: ['expose' => true])]
    public function login(Request $request, ClientRegistry $clientRegistry): RedirectResponse
    {
        // if ('test' == $params->get('app_env')) {
        //     return $this->testLogin($tokenStorage, $request, $urlGenerator);
        // }

        /** @var KeycloakClient */
        $client = $clientRegistry->getClient('keycloak');

        if ($request->query->get('side_login', false)) {
            $request->getSession()->set('side_login', true);
        }

        return $client->redirect(['openid', 'profile', 'email']);
    }

    #[Route('/login/check', name: 'cartesgouvfr_security_login_check', methods: ['GET'])]
    public function loginCheck(): void
    {
    }

    #[Route('/logout', name: 'cartesgouvfr_security_logout', methods: ['GET'])]
    public function logout(): void
    {
    }

    // #[Route('/get-user', name: 'get_user', methods: ['GET'], options: ['expose' => true], condition: 'request.isXmlHttpRequest()')]
    // public function getUserInfo(): JsonResponse
    // {
    //     /** @var User */
    //     $user = $this->getUser();

    //     if (null != $user) {
    //         return new JsonResponse([
    //             'first_name' => $user->getFirstName(),
    //             'last_name' => $user->getLastName(),
    //             'email' => $user->getEmail(),
    //         ]);
    //     }

    //     return new JsonResponse(['error' => 'not_authenticated'], Response::HTTP_UNAUTHORIZED);
    // }
}
