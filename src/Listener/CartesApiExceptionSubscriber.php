<?php

namespace App\Listener;

use App\Exception\CartesApiException;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class CartesApiExceptionSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private LoggerInterface $logger
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::EXCEPTION => 'onCartesApiException',
        ];
    }

    public function onCartesApiException(ExceptionEvent $event): void
    {
        $throwable = $event->getThrowable();

        if ($throwable instanceof CartesApiException) {
            $event->setResponse($this->getErrorResponse($throwable));
        }
    }

    private function getErrorResponse(CartesApiException $throwable): JsonResponse
    {
        $responseData = [
            'code' => Response::HTTP_INTERNAL_SERVER_ERROR,
            'status' => Response::$statusTexts[Response::HTTP_INTERNAL_SERVER_ERROR],
            'message' => 'An internal error has occurred',
            'details' => [],
        ];

        if ($throwable instanceof CartesApiException) {
            $code = $throwable->getCode();
            $responseData['code'] = $code;
            $responseData['status'] = Response::$statusTexts[$code];
            $responseData['message'] = $throwable->getMessage();
            $responseData['details'] = $throwable->getDetails();
        }

        $this->logger->debug('Exception[{throwable}]: {message}', [
            'throwable' => get_class($throwable),
            ...$responseData,
        ]);

        return new JsonResponse($responseData, $responseData['code']);
    }
}
