<?php

namespace App\Controller;

use App\Security\Authenticator\KeycloakAuthenticator;
use App\Security\State\LoginStateSerializer;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Stevenmaguire\OAuth2\Client\Provider\Keycloak;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
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
        #[MapQueryParameter] bool $popup = false,
    ): RedirectResponse {
        $iamLoginDisabled = boolval($params->get('iam_login_disabled'));
        if ($iamLoginDisabled) {
            return $this->redirect($this->generateUrl(KeycloakAuthenticator::HOME_ROUTE, [], UrlGeneratorInterface::ABSOLUTE_URL).'connexion-desactivee');
        }

        // le referer voyage dans le state de l’URL Keycloak : longueur bornée
        $referer = $request->headers->get('referer');
        $safeReferer = is_string($referer) && \strlen($referer) <= 2048 && str_starts_with($referer, $request->getSchemeAndHttpHost().'/') ? $referer : null;

        // le cookie lie le state à ce navigateur : un lien /login/check fabriqué par un tiers échoue (login CSRF)
        $nonce = bin2hex(random_bytes(16));
        $state = $loginStateSerializer->encode([
            'referer' => $safeReferer,
            'popup' => $popup,
            'nonce' => $nonce,
        ]);

        $response = $clientRegistry->getClient('keycloak')->redirect(['openid', 'profile', 'email'], ['state' => $state]);
        $response->headers->setCookie(Cookie::create(KeycloakAuthenticator::STATE_COOKIE_NAME, $nonce, time() + LoginStateSerializer::LIFETIME, '/', null, true, true, false, Cookie::SAMESITE_LAX));

        return $response;
    }

    #[Route('/login/check', name: 'login_check', methods: ['GET'])]
    public function loginCheck(): void
    {
    }

    // fin du login ouvert en popup : la page se ferme seule, l’onglet d’origine relit l’utilisateur
    #[Route('/login/popup-callback', name: 'login_popup_callback', methods: ['GET'])]
    public function loginPopupCallback(): Response
    {
        $response = $this->render('security/login_popup_callback.html.twig');
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }

    #[Route('/logout', name: 'logout', methods: ['GET'], options: ['expose' => true])]
    public function logout(): void
    {
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
