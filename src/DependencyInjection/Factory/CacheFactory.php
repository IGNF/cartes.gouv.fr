<?php

namespace App\DependencyInjection\Factory;

use Symfony\Component\Cache\Adapter\AdapterInterface;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Component\Cache\Adapter\RedisAdapter;
use Symfony\Component\HttpFoundation\Session\Storage\Handler\AbstractSessionHandler;
use Symfony\Component\HttpFoundation\Session\Storage\Handler\NativeFileSessionHandler;
use Symfony\Component\HttpFoundation\Session\Storage\Handler\RedisSessionHandler;
use Symfony\Component\HttpFoundation\Session\Storage\Handler\StrictSessionHandler;

class CacheFactory
{
    public function __construct(
        private string $redisUrl,
        private string $projectDir,
        private string $env,
    ) {
    }

    public function createCacheAdapter(): AdapterInterface
    {
        $conn = $this->getRedisConnection();
        if (null !== $conn) {
            return new RedisAdapter($conn);
        }

        return new FilesystemAdapter();
    }

    public function createSessionHandler(): AbstractSessionHandler
    {
        $conn = $this->getRedisConnection();
        if (null !== $conn) {
            return new RedisSessionHandler($conn);
        }

        return new StrictSessionHandler(new NativeFileSessionHandler(sprintf('%s/var/sessions/%s', $this->projectDir, $this->env)));
    }

    private function getRedisConnection(): ?\Predis\ClientInterface
    {
        try {
            if (null !== $this->redisUrl && '' !== $this->redisUrl) {
                $conn = RedisAdapter::createConnection($this->redisUrl);
                $conn->ping('Redis healthcheck');

                return $conn;
            }

            throw new \Exception('REDIS_URL non fourni');
        } catch (\Exception) {
            return null;
        }
    }
}
