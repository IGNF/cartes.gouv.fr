<?php

namespace App\Controller;

use App\Exception\AppException;
use App\Security\State\LoginStateSerializer;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Stevenmaguire\OAuth2\Client\Provider\Keycloak;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

#[Route(
    name: 'cartesgouvfr_security_',
)]
class SecurityController extends AbstractController
{
    #[Route('/login', name: 'login', methods: ['GET'], options: ['expose' => true])]
    public function login(
        Request $request,
        ClientRegistry $clientRegistry,
        ParameterBagInterface $params,
        LoginStateSerializer $loginStateSerializer,
    ): RedirectResponse {
        $iamLoginDisabled = boolval($params->get('iam_login_disabled'));
        if ($iamLoginDisabled) {
            return $this->redirect($this->generateUrl('cartesgouvfr_app', [], UrlGeneratorInterface::ABSOLUTE_URL).'connexion-desactivee');
        }

        $state = $loginStateSerializer->encode([
            'referer' => $request->headers->get('referer'),
            'app' => $request->query->get('app'),
            'session_expired' => $request->query->get('session_expired'),
            'silent' => $request->query->get('silent'),
        ]);

        $client = $clientRegistry->getClient('keycloak');

        $extraOptions = ['state' => $state];
        if ($request->query->has('prompt')) {
            $extraOptions['prompt'] = $request->query->get('prompt');
        }

        return $client->redirect(['openid', 'profile', 'email'], $extraOptions);
    }

    #[Route('/login/check', name: 'login_check', methods: ['GET'])]
    public function loginCheck(): void
    {
    }

    #[Route('/login/silent-callback', name: 'login_silent_callback', methods: ['GET'])]
    public function silentCallback(Request $request): Response
    {
        $status = in_array($request->query->get('status'), ['ok', 'error'], true)
            ? $request->query->get('status')
            : 'ok';

        $payload = json_encode(['type' => 'cgfr_silent_reauth', 'status' => $status]);

        return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>'
            .'<script>window.parent.postMessage('.$payload.', location.origin);window.close();</script>'
            .'</body></html>',
            Response::HTTP_OK,
            ['Content-Type' => 'text/html; charset=utf-8']
        );
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

    #[Route('/userinfo/edit', name: 'userinfo_edit', methods: ['GET'], options: ['expose' => true])]
    public function userInfoEdit(ClientRegistry $clientRegistry): RedirectResponse
    {
        $client = $clientRegistry->getClient('keycloak');

        /** @var Keycloak */
        $keycloak = $client->getOAuth2Provider();

        $iamRealm = $this->getParameter('iam_realm');

        $accountUrl = "{$keycloak->authServerUrl}/realms/{$iamRealm}/account";

        return $this->redirect($accountUrl);
    }
}
