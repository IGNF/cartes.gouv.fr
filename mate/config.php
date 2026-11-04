<?php

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $container): void {
    $container->parameters()
        // Mate s’exécute dans le conteneur de dev, avec son PHP
        ->set('mate.invocation', 'docker exec cartesgouvfr-app_dev-1 vendor/bin/mate')
        ->set('mate.php_version', '8.5')
    ;
};
