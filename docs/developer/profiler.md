# Profileur Symfony (debug)

Le profileur stocke ses données dans `var/cache/dev/profiler/` dans le conteneur. Pour lire un profil à partir de son token (affiché dans l'en-tête `X-Debug-Token` ou la barre de debug) :

```bash
docker exec cartesgouvfr-app_dev-1 php -r "
require 'vendor/autoload.php';
use Symfony\Component\HttpKernel\Profiler\FileProfilerStorage;
\\\$storage = new FileProfilerStorage('file:'.getcwd().'/var/cache/dev/profiler');
\\\$profile = \\\$storage->read('TOKEN'); // remplacer TOKEN par le token du profiler
if (!\\\$profile) { echo 'Non trouvé'; exit; }
echo 'URL: '.\\\$profile->getUrl().PHP_EOL;
\\\$time = \\\$profile->getCollector('time');
echo 'Durée: '.\\\$time->getDuration().' ms'.PHP_EOL;
foreach (\\\$time->getEvents() as \\\$name => \\\$event) {
    printf('  %-60s %6.1f ms'.PHP_EOL, \\\$name, \\\$event->getDuration());
}
"
```

Autres collectors utiles : `http_client`, `db`, `logger`, `request`, `security`, `exception`.
