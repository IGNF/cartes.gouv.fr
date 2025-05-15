<?php

namespace App\Services;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class CswTopicCategories
{
    /** @var array<string> */
    private array $allTopics = [];

    public function __construct(
        ParameterBagInterface $params,
    ) {
        $content = file_get_contents($params->get('assets_directory').'/data/topic_categories.json');
        if (false !== $content) {
            $this->allTopics = json_decode($content, true);
        }
    }

    /**
     * @param array<string> $frenchTopics
     *
     * @return array<string>
     */
    public function toEnglish(array $frenchTopics): array
    {
        $englishTopics = [];
        $allTopics = array_flip($this->allTopics); // français => anglais
        foreach ($frenchTopics as $topic) {
            if (isset($allTopics[$topic])) {
                $englishTopics[] = $allTopics[$topic];
            }
        }

        return $englishTopics;
    }

    /**
     * @param array<string> $englishTopics
     *
     * @return array<string>
     */
    public function toFrench(array $englishTopics): array
    {
        $frenchTopics = [];
        $allTopics = $this->allTopics;
        foreach ($englishTopics as $topic) {
            if (isset($allTopics[$topic])) {
                $frenchTopics[] = $allTopics[$topic];
            }
        }

        return $frenchTopics;
    }
}
