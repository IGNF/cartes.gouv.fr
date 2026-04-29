<?php

namespace App\Services;

use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Yaml\Yaml;
use Twig\Environment as TwigEnvironment;

class MailerService
{
    public function __construct(
        private ParameterBagInterface $parameters,
        private TwigEnvironment $twig,
        private MailerInterface $mailer,
        private LoggerInterface $logger)
    {
    }

    /**
     * @param array<mixed> $params
     *
     * @throws TransportExceptionInterface
     */
    public function sendMail(string $to, string $subject, string $templateName, array $params = []): void
    {
        $body = $this->twig->render($templateName, $params);

        $email = (new TemplatedEmail())
            ->from(new Address($this->parameters->get('mailer_sender_address'), 'cartes.gouv.fr'))
            ->to(new Address($to))
            ->subject($subject)
            ->html($body)
        ;

        try {
            $this->mailer->send($email);
        } catch (TransportExceptionInterface $ex) {
            // On conserve uniquement le domaine pour diagnostiquer des incidents par fournisseur,
            // sans exposer l'adresse email complète du destinataire.
            $recipientDomain = substr(strrchr($to, '@') ?: '', 1) ?: 'unknown';

            // Le hash du sujet permet de corréler des échecs similaires sans stocker le sujet en clair.
            $this->logger->error('mail.transport.failure', [
                'template' => $templateName,
                'subject_hash' => hash('sha256', $subject),
                'recipient_domain' => $recipientDomain,
                'error_code' => $ex->getCode(),
            ]);
            throw $ex;
        }
    }

    public function containsBannedWords(string $text): bool
    {
        $bannedWords = Yaml::parseFile(__DIR__.'/../../config/app/banned_words.yml');

        foreach ($bannedWords as $bannedWord) {
            if (str_contains(strtolower($text), $bannedWord)) {
                return true;
            }
        }

        return false;
    }
}
