<?php

namespace App\Controller;

use App\Exception\AppException;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\Provider\KeycloakClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(name: 'cartesgouvfr_security_')]
class SecurityController extends AbstractController
{
    #[Route('/login', name: 'login', methods: ['GET'], options: ['expose' => true])]
    public function login(Request $request, ClientRegistry $clientRegistry): RedirectResponse
    {
        // if ('test' == $params->get('app_env')) {
        //     return $this->testLogin($tokenStorage, $request, $urlGenerator);
        // }

        $referer = $request->headers->get('referer');
        $request->getSession()->set('referer', $referer);

        /** @var KeycloakClient */
        $client = $clientRegistry->getClient('keycloak');

        if ($request->query->get('side_login', false)) {
            $request->getSession()->set('side_login', true);
        }

        return $client->redirect(['openid', 'profile', 'email']);
    }

    #[Route('/login/check', name: 'login_check', methods: ['GET'])]
    public function loginCheck(): void
    {
    }

    #[Route('/logout', name: 'logout', methods: ['GET'], options: ['expose' => true])]
    public function logout(): void
    {
    }

    #[Route('/signup', name: 'signup', methods: ['GET'], options: ['expose' => true])]
    public function signup(): RedirectResponse
    {
        throw new AppException('not yet implemented');
    }
}
