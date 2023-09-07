<?php

namespace App\Controller;

use App\Exception\AppException;
use App\Security\User;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\Provider\KeycloakClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
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
        RouterInterface $router
    ): RedirectResponse {
        $referer = $request->headers->get('referer');
        $request->getSession()->set('referer', $referer);

        //  création d'un utilisateur bidon si en mode test
        if ('test' === $params->get('app_env')) {
            return $this->testLogin($tokenStorage, $request, $router);
        }

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

    private function testLogin(
        TokenStorageInterface $tokenStorage,
        Request $request,
        RouterInterface $router
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
