<?php

namespace App\Listener;

use App\Serializer\ApiErrorEncoder;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Rend les erreurs des routes d'API en application/problem+json, même sans en-tête Accept (appel de /contact_us par le site de documentation).
 */
final readonly class ApiErrorFormatListener
{
    public function __construct(
        #[Autowire(param: 'app.api_path_pattern')]
        private string $apiPathPattern,
    ) {
    }

    // avant ErrorListener (-128), et pas sur kernel.request pour laisser intactes les réponses réussies
    #[AsEventListener(event: KernelEvents::EXCEPTION)]
    public function onKernelException(ExceptionEvent $event): void
    {
        $request = $event->getRequest();
        if (1 === preg_match($this->apiPathPattern, $request->getPathInfo())) {
            $request->setRequestFormat(ApiErrorEncoder::FORMAT);
        }
    }
}
