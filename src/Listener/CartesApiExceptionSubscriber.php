<?php

namespace App\Listener;

use App\Exception\CartesApiException;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Validator\Exception\ValidationFailedException;

class CartesApiExceptionSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private LoggerInterface $logger,
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
        } elseif ($throwable instanceof HttpException) {
            if (422 === $throwable->getStatusCode()) { // Erreur de validation avec un DTO
                $e = $this->format($throwable);
                $event->setResponse($this->getErrorResponse($e));
            }
        }
    }

    /**
     * @SuppressWarnings(UndefinedVariable)
     */
    private function getErrorResponse(CartesApiException $throwable): JsonResponse
    {
        $responseData = [
            'code' => Response::HTTP_INTERNAL_SERVER_ERROR,
            'status' => Response::$statusTexts[Response::HTTP_INTERNAL_SERVER_ERROR],
            'message' => 'An internal error has occurred',
            'details' => [],
        ];

        $code = $throwable->getStatusCode();
        if ($code < 400 || $code > 599) {
            $code = Response::HTTP_INTERNAL_SERVER_ERROR;
        }

        $responseData['code'] = $code;
        $responseData['status'] = Response::$statusTexts[$code] ?? Response::$statusTexts[Response::HTTP_INTERNAL_SERVER_ERROR];
        $responseData['message'] = $throwable->getMessage();
        $responseData['details'] = $throwable->getDetails();

        $this->logger->debug('Exception[{throwable}]: {message}', [
            'throwable' => get_class($throwable),
            ...$responseData,
        ]);

        return new JsonResponse($responseData, $responseData['code']);
    }

    private function format(HttpException $e): CartesApiException
    {
        $previous = $e->getPrevious();
        $details = [];

        if ($previous instanceof ValidationFailedException) {
            $errors = [];
            foreach ($previous->getViolations() as $violation) {
                // La propriété peut déjà être présente si plusieurs contraintes échouent
                // sur le même champ : on garde le premier message (le plus prioritaire).
                $path = $violation->getPropertyPath();
                if (!array_key_exists($path, $errors)) {
                    $errors[$path] = $violation->getMessage();
                }
            }
            $details = ['errors' => $errors];
        }

        return new CartesApiException($e->getMessage(), $e->getStatusCode(), $details);
    }
}
