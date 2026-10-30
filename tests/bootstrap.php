<?php

use Symfony\Component\Dotenv\Dotenv;

require __DIR__.'/../vendor/autoload.php';

if (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(__DIR__.'/../.env');
}

if ($_SERVER['APP_DEBUG']) {
    umask(0000);
}
