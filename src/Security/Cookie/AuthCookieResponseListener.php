<?php

namespace App\Security\Cookie;

use League\OAuth2\Client\Token\AccessToken;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

final class AuthCookieResponseListener implements EventSubscriberInterface
{
    public const COOKIE_NAME = '__Host-CGAUTH';
    public const REQUEST_ATTR_INTENT = '_auth_cookie_intent';
    public const INTENT_CLEAR = '__clear__';

    public function __construct(private AuthCookieCipher $cipher)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::RESPONSE => ['onKernelResponse', 0]];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $intent = $event->getRequest()->attributes->get(self::REQUEST_ATTR_INTENT);
        if (null === $intent) {
            return;
        }

        $response = $event->getResponse();

        if (self::INTENT_CLEAR === $intent) {
            $response->headers->clearCookie(self::COOKIE_NAME, '/', null, true, true, 'lax');

            return;
        }

        if ($intent instanceof AccessToken) {
            $cookie = Cookie::create(self::COOKIE_NAME)
                ->withValue($this->cipher->encrypt(serialize($intent)))
                ->withHttpOnly(true)
                ->withSecure(true)
                ->withSameSite(Cookie::SAMESITE_LAX)
                ->withPath('/');

            $expires = $intent->getExpires();
            if (null !== $expires) {
                $cookie = $cookie->withExpires($expires);
            }

            $response->headers->setCookie($cookie);
        }
    }
}
