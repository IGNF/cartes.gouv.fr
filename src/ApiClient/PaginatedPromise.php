<?php

namespace App\ApiClient;

final class PaginatedPromise
{
    /** @var array<mixed>|null */
    private ?array $resolved = null;

    public function __construct(
        private readonly ResponsePromise $page1Pending,
        private readonly \Closure $remainingPagesFetcher,
    ) {
    }

    /**
     * @return array<mixed>
     * */
    public function resolve(): array
    {
        if (null !== $this->resolved) {
            return $this->resolved;
        }
        $firstPage = $this->page1Pending->arrayWithHeaders();
        $resolved = ($this->remainingPagesFetcher)($firstPage);
        $this->resolved = $resolved;

        return $resolved;
    }

    /**
     * Abandonne la lecture, à n’appeler qu’en fin d’usage : la réponse annulée ne peut plus être lue.
     */
    public function cancel(): void
    {
        $this->page1Pending->getResponse()->cancel();
    }

    /**
     * Applique une transformation sur le tableau résolu, en restant lazy.
     *
     * @param callable(array<mixed>): array<mixed> $transform
     */
    public function then(callable $transform): self
    {
        $fetcher = $this->remainingPagesFetcher;

        return new self(
            $this->page1Pending,
            fn (PaginatedResponse $firstPage) => $transform($fetcher($firstPage)),
        );
    }
}
