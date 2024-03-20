<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;

#[AsCommand(
    name: 'cartesgouvfr:var-data-cleanup',
    description: 'Supprime des fichiers temporaires (des fichiers téléversés par exemple) de plus de 24h',
)]
class VarDataCleanupCommand extends Command
{
    private string $directory;
    private Filesystem $fs;

    public function __construct(ParameterBagInterface $params)
    {
        $this->directory = $params->get('var_data_path');
        $this->fs = new Filesystem();
        parent::__construct();
    }

    protected function configure(): void
    {
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $now = new \DateTime('now');
        $io->note("Date d'exécution : ".$now->format('Y-m-d H:i:s'));

        $fs = new Filesystem();

        if (!$fs->exists($this->directory)) {
            $io->note("Il n'y a aucun fichier à supprimer, le répertoire [$this->directory] n'existe pas encore");

            return Command::SUCCESS;
        }

        $this->deleteOldFiles($io);

        $this->deleteEmptyDirs($io);

        return Command::SUCCESS;
    }

    private function deleteOldFiles(SymfonyStyle $io): void
    {
        $finder = new Finder();

        $finder->date('before 1 day ago')->in($this->directory)->files();

        /** @var array<SplFileInfo> */
        $files = iterator_to_array($finder, true);

        $deleteFileCount = $this->deleteFiles($files, $io);

        $io->success(sprintf('Nombre de fichiers supprimés : %d', $deleteFileCount));
    }

    private function deleteEmptyDirs(SymfonyStyle $io): void
    {
        $finder = new Finder();

        $finder->in($this->directory)->directories()->filter(function (SplFileInfo $directory) {
            $tmpFinder = new Finder();
            $tmpFinder->in($directory->getRealPath());

            $tmpFilesArray = iterator_to_array($tmpFinder, true);

            return 0 === count($tmpFilesArray);
        });

        /** @var array<SplFileInfo> */
        $files = iterator_to_array($finder, true);

        $deleteFileCount = $this->deleteFiles($files, $io);

        $io->success(sprintf('Nombre de répertoires vides supprimés : %d', $deleteFileCount));
    }

    /**
     * @param array<SplFileInfo> $files
     */
    private function deleteFiles(array $files, SymfonyStyle $io): int
    {
        $deleteFileCount = 0;
        foreach ($files as $file) {
            $absoluteFilePath = $file->getRealPath();

            try {
                $this->fs->remove($absoluteFilePath);
                $io->note(sprintf('%s supprimé', str_replace($this->directory, '', $absoluteFilePath)));
                ++$deleteFileCount;
            } catch (\Exception $ex) {
                $io->warning(sprintf("%s n'a pu être supprimé", str_replace($this->directory, '', $absoluteFilePath)));
            }
        }

        return $deleteFileCount;
    }
}
