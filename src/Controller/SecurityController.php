<?php

namespace App\Controller;

use App\Exception\AppException;
use App\Security\KeycloakToken;
use App\Security\User;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\Provider\KeycloakClient;
use League\OAuth2\Client\Token\AccessToken;
use Stevenmaguire\OAuth2\Client\Provider\Keycloak;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Http\Util\TargetPathTrait;

#[Route(
    name: 'cartesgouvfr_security_',
)]
class SecurityController extends AbstractController
{
    use TargetPathTrait;

    #[Route('/login', name: 'login', methods: ['GET'], options: ['expose' => true])]
    public function login(
        Request $request,
        ClientRegistry $clientRegistry,
        ParameterBagInterface $params,
        TokenStorageInterface $tokenStorage,
        RouterInterface $router,
    ): RedirectResponse {
        $iamLoginDisabled = boolval($params->get('iam_login_disabled'));
        if ($iamLoginDisabled) {
            return $this->redirect($this->generateUrl('cartesgouvfr_app', [], UrlGeneratorInterface::ABSOLUTE_URL).'connexion-desactivee');
        }

        $referer = $request->headers->get('referer');
        $request->getSession()->set('referer', $referer);

        $sessionExpired = $request->query->get('session_expired');
        $request->getSession()->set('session_expired', $sessionExpired);

        //  création d'un utilisateur bidon si en mode test
        if ('test' === $params->get('app_env')) {
            return $this->testLogin($tokenStorage, $request, $router);
        }

        /** @var KeycloakClient */
        $client = $clientRegistry->getClient('keycloak');

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

    #[Route('/userinfo/edit', name: 'userinfo_edit', methods: ['GET'], options: ['expose' => true])]
    public function userInfoEdit(ClientRegistry $clientRegistry): RedirectResponse
    {
        /** @var KeycloakClient */
        $client = $clientRegistry->getClient('keycloak');

        /** @var Keycloak */
        $keycloak = $client->getOAuth2Provider();

        $iamRealm = $this->getParameter('iam_realm');

        $accountUrl = "{$keycloak->authServerUrl}/realms/{$iamRealm}/account";

        return $this->redirect($accountUrl);
    }

    #[Route('/login/entree-carto/', name: 'login_entree_carto', methods: ['GET'])]
    public function loginEntreeCarto(Request $request): RedirectResponse
    {
        /** @var ?AccessToken */
        $token = $request->getSession()->get(KeycloakToken::SESSION_KEY);

        // un token null signifie qu'on n'est pas connecté, donc on fait la connexion sur cartes d'abord. Après la connexion on revient ici et envoie le token à entree-carto par une redirection
        if (null === $token) {
            $request->getSession()->set('login_entree_carto', 1);

            return new RedirectResponse($this->generateUrl('cartesgouvfr_security_login'));
        }
        $tokenArray = $token->jsonSerialize();

        // $entreeCartoLoginCallbackUrl = $this->generateUrl('cartesgouvfr_app', [], UrlGeneratorInterface::ABSOLUTE_URL).'cartes';
        $entreeCartoLoginCallbackUrl = 'http://localhost:5173/cartes.gouv.fr-entree-carto/login';

        return new RedirectResponse($entreeCartoLoginCallbackUrl.'?'.http_build_query([
            'token' => json_encode($tokenArray),
        ]));
    }

    private function testLogin(
        TokenStorageInterface $tokenStorage,
        Request $request,
        RouterInterface $router,
    ): RedirectResponse {
        $user = User::getTestUser();

        $firewallName = 'main';
        $token = new UsernamePasswordToken($user, $firewallName, $user->getRoles());
        $tokenStorage->setToken($token);

        $referer = $request->getSession()->get('referer', false);
        if ($referer) {
            $request->getSession()->remove('referer');

            return new RedirectResponse($referer);
        }

        $targetPath = $this->getTargetPath($request->getSession(), $firewallName);

        if ($targetPath) {
            return new RedirectResponse($targetPath);
        }

        return new RedirectResponse($router->generate('cartesgouvfr_app'));
    }
}
