<?php

declare(strict_types=1);

namespace App\Tests\Double;

use Symfony\Component\Lock\Exception\LockStorageException;
use Symfony\Component\Lock\Key;
use Symfony\Component\Lock\PersistingStoreInterface;

/**
 * Stockage de verrous indisponible : toute prise de verrou échoue.
 */
final class BrokenLockStore implements PersistingStoreInterface
{
    public function save(Key $key): void
    {
        throw new LockStorageException('stockage indisponible');
    }

    public function delete(Key $key): void
    {
    }

    public function exists(Key $key): bool
    {
        return false;
    }

    public function putOffExpiration(Key $key, float $ttl): void
    {
    }
}
