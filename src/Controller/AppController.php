<?php

namespace App\Controller;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\OfferingTypes;
use App\Constants\MetadataFields;
use App\Entity\CswMetadata\CswHierarchyLevel;
use App\Entity\CswMetadata\CswLanguage;
use App\Entity\CswMetadata\CswMetadata;
use App\Entity\CswMetadata\CswMetadataLayer;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;

class AppController extends AbstractController
{
    #[Route(
        '/{reactRouting}',
        name: 'cartesgouvfr_app',
        priority: -1,
        defaults: ['reactRouting' => null],
        requirements: ['reactRouting' => '.+'],
        options: ['expose' => true]
    )]
    public function app(UrlGeneratorInterface $urlGenerator): Response
    {
        $appRoot = $urlGenerator->generate('cartesgouvfr_app', [], UrlGeneratorInterface::ABSOLUTE_PATH);
        $appRoot = substr($appRoot, 0, -1);

        return $this->render('app.html.twig', [
            'app_root' => $appRoot,
            // 'info_banner_msg' => 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae officiis incidunt, quia unde quisquam adipisci eum excepturi voluptas delectus voluptatibus consectetur porro necessitatibus itaque ipsum deserunt fugit. Iure, id obcaecati!',
        ]);
    }

    // #[Route('/test')]
    // public function test(EntrepotApiService $entrepotApiService): Response
    // {
    //     $datastoreId = '190b714d-daa7-402b-8360-c75baa4c69cc';
    //     $configList = $entrepotApiService->configuration->getAllDetailed($datastoreId, [
    //         'tags' => [
    //             CommonTags::DATASHEET_NAME => 'test avec metadata arnest',
    //         ],
    //     ]);

    //     $layers = array_map(function (array $configuration) use ($datastoreId, $entrepotApiService) {
    //         $relations = $configuration['type_infos']['used_data'][0]['relations'];
    //         $offering = $entrepotApiService->configuration->getConfigurationOfferings($datastoreId, $configuration['_id'])[0];
    //         $offering = $entrepotApiService->configuration->getOffering($datastoreId, $offering['_id']);

    //         $serviceEndpoint = $entrepotApiService->datastore->getEndpoint($datastoreId, $offering['endpoint']['_id']);

    //         $relationLayers = array_map(function ($relation) use ($offering, $serviceEndpoint) {
    //             $layerName = null;
    //             $endpointType = null;

    //             switch ($offering['type']) {
    //                 case OfferingTypes::WFS:
    //                     $layerName = sprintf('%s:%s', $offering['layer_name'], $relation['native_name']);
    //                     $endpointType = 'OGC:WFS';
    //                     break;

    //                 case OfferingTypes::WMSVECTOR:
    //                     $layerName = sprintf('%s:%s', $offering['layer_name'], $relation['name']);
    //                     $endpointType = 'OGC:WMS';
    //                     break;

    //                 case OfferingTypes::WMTSTMS:
    //                     $layerName = $offering['layer_name'];
    //                     $endpointType = 'OGC:TMS';
    //                     break;
    //             }

    //             return [
    //                 MetadataFields::LAYER_NAME => $layerName,
    //                 MetadataFields::LAYER_ENDPOINT_TYPE => $endpointType,
    //                 MetadataFields::LAYER_ENDPOINT_URL => $serviceEndpoint['endpoint']['urls'][0]['url'],
    //                 MetadataFields::LAYER_OFFERING_ID => $offering['_id'],
    //             ];
    //         }, $relations);

    //         return $relationLayers;
    //     }, $configList);

    //     $layers = array_merge(...$layers);
    //     dd($layers);

    //     return $this->render('$0.html.twig', []);
    // }

    // #[Route('/test2')]
    // public function test2(EntrepotApiService $entrepotApiService, MetadataHelper $metadataHelper, SerializerInterface $serializer): Response
    // {
    //     $datastoreId = '190b714d-daa7-402b-8360-c75baa4c69cc';
    //     $metadataId = '45ceb35e-bbfa-4f98-ae5e-f2f06ba72104';

    //     $metadataXml = $entrepotApiService->metadata->downloadFile($datastoreId, $metadataId);
    //     $md = $metadataHelper->convertXmlToArray($metadataXml);

    //     // dd($md);

    //     $datasheetName = 'test avec metadata arnest';

    //     $metadata = new CswMetadata(
    //         $md[MetadataFields::FILE_IDENTIFIER],
    //         CswHierarchyLevel::from($md[MetadataFields::HIERARCHY_LEVEL]),
    //         new CswLanguage($md[MetadataFields::LANGUAGE][MetadataFields::LANGUAGE_CODE], $md[MetadataFields::LANGUAGE][MetadataFields::LANGUAGE_TEXT]),
    //         $md[MetadataFields::CHARSET],
    //         $md[MetadataFields::TITLE],
    //         $md[MetadataFields::ABSTRACT],
    //         $md[MetadataFields::CREATION_DATE],
    //         $md[MetadataFields::THEMATIC_CATEGORIES],
    //         $md[MetadataFields::CONTACT_EMAIL],
    //         $md[MetadataFields::ORGANISATION_NAME],
    //         $md[MetadataFields::ORGANISATION_EMAIL],
    //         $this->getMetadataLayers($datastoreId, $datasheetName, $entrepotApiService),
    //     );

    //     // $normalizers = [new ObjectNormalizer()];
    //     // $encoders = [new JsonEncoder()];
    //     // $serializer = new Serializer($normalizers, $encoders);

    //     // $serializer->serialize($metadata, 'json', [
    //     //     // ObjectNormalizer::
    //     // ]);

    //     // dd($serializer->serialize($metadata, 'json'));

    //     $metadataJson = $serializer->serialize($metadata, 'json');

    //     $xml = $this->renderView('metadata/metadata_dataset_iso.xml.twig', json_decode($metadataJson, true));
    //     // dd($xml);

    //     // return new Response($xml, 200, [
    //     //     'Content-Type' => 'application/xml',
    //     // ]);

    //     // dd(json_decode($metadataJson, true));
    //     // dd($serializer->deserialize($metadataJson, CswMetadata::class, 'json'));
    //     dd(json_encode($serializer->deserialize($metadataJson, CswMetadata::class, 'json')));

    //     // dd($metadata);
    //     // $data = $metadata;
    //     // // dd(json_decode(json_encode($metadata), true));

    //     // $this->container->get('serializer')->serialize($metadata, 'json', [
    //     //     'json_encode_options' => JsonResponse::DEFAULT_ENCODING_OPTIONS,
    //     // ]);

    //     // dd($data);

    //     // if ($this->container->has('serializer')) {
    //     //     $json = $this->container->get('serializer')->serialize($data, 'json', array_merge([
    //     //         'json_encode_options' => JsonResponse::DEFAULT_ENCODING_OPTIONS,
    //     //     ], $context));

    //     //     return new JsonResponse($json, $status, $headers, true);
    //     // }

    //     // return $this->render('metadata/metadata_dataset_iso.xml.twig', json_decode(json_encode($metadata), true));

    //     return $this->json($metadata);
    // }

    // #[Route('/test3')]
    // public function test3(EntrepotApiService $entrepotApiService, MetadataHelper $metadataHelper): Response
    // {
    //     $datastoreId = '190b714d-daa7-402b-8360-c75baa4c69cc';
    //     $metadataId = '45ceb35e-bbfa-4f98-ae5e-f2f06ba72104';

    //     $metadataXml = $entrepotApiService->metadata->downloadFile($datastoreId, $metadataId);
    //     // dump($metadataXml);

    //     // return new Response($metadataXml, 200, [
    //     //     'Content-Type' => 'application/xml',
    //     // ]);

    //     $metadata = $metadataHelper->fromXml($metadataXml);
    //     // dump($metadata);

    //     $mdEntrepot = [
    //         '_id' => 'sqdsq',
    //         'content' => $metadata,
    //     ];

    //     // dd($mdEntrepot);

    //     // $json = $metadataHelper->toJson($mdEntrepot['content']);

    //     dd($metadataHelper->fromJson($json));

    //     dd();
    // }

    // private function getMetadataLayers(string $datastoreId, string $datasheetName, EntrepotApiService $entrepotApiService): array
    // {
    //     $configList = $entrepotApiService->configuration->getAllDetailed($datastoreId, [
    //         'tags' => [
    //             CommonTags::DATASHEET_NAME => $datasheetName,
    //         ],
    //     ]);

    //     $layers = array_map(function (array $configuration) use ($datastoreId, $entrepotApiService) {
    //         $configRelations = $configuration['type_infos']['used_data'][0]['relations'];

    //         $offering = $entrepotApiService->configuration->getConfigurationOfferings($datastoreId, $configuration['_id'])[0];
    //         $offering = $entrepotApiService->configuration->getOffering($datastoreId, $offering['_id']);

    //         $serviceEndpoint = $entrepotApiService->datastore->getEndpoint($datastoreId, $offering['endpoint']['_id']);

    //         $relationLayers = array_map(function ($relation) use ($offering, $serviceEndpoint) {
    //             $layerName = null;
    //             $endpointType = null;

    //             switch ($offering['type']) {
    //                 case OfferingTypes::WFS:
    //                     $layerName = sprintf('%s:%s', $offering['layer_name'], $relation['native_name']);
    //                     $endpointType = 'OGC:WFS';
    //                     break;

    //                 case OfferingTypes::WMSVECTOR:
    //                     $layerName = sprintf('%s:%s', $offering['layer_name'], $relation['name']);
    //                     $endpointType = 'OGC:WMS';
    //                     break;

    //                 case OfferingTypes::WMTSTMS:
    //                     $layerName = $offering['layer_name'];
    //                     $endpointType = 'OGC:TMS';
    //                     break;
    //                 default:
    //                     $layerName = $offering['layer_name'];
    //                     $endpointType = '';
    //                     break;
    //             }

    //             return new CswMetadataLayer($layerName, $endpointType, $serviceEndpoint['endpoint']['urls'][0]['url'], $offering['_id']);

    //             // return [
    //             //     MetadataFields::LAYER_NAME => $layerName,
    //             //     MetadataFields::LAYER_ENDPOINT_TYPE => $endpointType,
    //             //     MetadataFields::LAYER_ENDPOINT_URL => $serviceEndpoint['endpoint']['urls'][0]['url'],
    //             //     MetadataFields::LAYER_OFFERING_ID => $offering['_id'],
    //             // ];
    //         }, $configRelations);

    //         return $relationLayers;
    //     }, $configList);

    //     $layers = array_merge(...$layers);

    //     return $layers;
    // }
}
