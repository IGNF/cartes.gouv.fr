# Typage de l'API Entrepôt

Grâce à l'outil en ligne de commande [swagger-typescript-api](https://github.com/acacode/swagger-typescript-api), il est possible de générer les déclarations typescript à partir du fichier de spécifications OpenAPI.

1. Générer les déclarations typescript dans un fichier temporaire `entrepot-generated.ts`

```bash
npx swagger-typescript-api@latest generate -p <chemin/vers/fichier/openapi> -o assets/@types -n entrepot-generated.ts --extract-enums --no-client
```

2. Corriger le fichier auto-généré et ensuite sauvegarder dans un autre fichier `entrepot.ts`

> ❗ Ne pas importer les types/interfaces etc directement depuis le fichier auto-généré `entrepot-generated.ts` parce qu'il y a beaucoup de choses dont on se sert pas et il peut y avoir des incohérences (par ex. des références circulaires) qui doivent être corrigées.
>
> Il est conseillé de re-déclarer les types dans le fichier `app.ts` pour renommer les types et les interfaces et les importer depuis celui-ci.

3. Supprimer le fichier auto-généré. ❗ Ne pas le commiter ❗

## Corrections manuelles à faire

- Supprimer les références circulaires
- `StoredDataDetailsDto` :

```ts
export type StoredDataDetailsDto =
    | StoredDataRok4PyramidRasterDetailsDto
    | StoredDataRok4PyramidVectorDetailsDto
    | StoredDataVectorDbDetailsDto
    | StoredDataArchiveDetailsDto
    | StoredDataGraphDbDetailsDto
    | StoredDataGraphDetailsDto
    | StoredDataIndexDetailsDto;
```

```diff
-export type StoredDataArchiveDetailsDto = StoredDataDetailsDto & {
+export type StoredDataArchiveDetailsDto = {
...
-export type StoredDataGraphDbDetailsDto = StoredDataDetailsDto & {
+export type StoredDataGraphDbDetailsDto = {
...
-export type StoredDataGraphDetailsDto = StoredDataDetailsDto & {
+export type StoredDataGraphDetailsDto =  {
...
-export type StoredDataIndexDetailsDto = StoredDataDetailsDto & {
+export type StoredDataIndexDetailsDto = {
...
-export type StoredDataRok4PyramidRasterDetailsDto = StoredDataDetailsDto & {
+export type StoredDataRok4PyramidRasterDetailsDto = {
...
-export type StoredDataRok4PyramidVectorDetailsDto = StoredDataDetailsDto & {
+export type StoredDataRok4PyramidVectorDetailsDto = {
...
-export type StoredDataVectorDbDetailsDto = StoredDataDetailsDto & {
+export type StoredDataVectorDbDetailsDto = {
```

- `ConfigurationStandardDetailResponseDtoStatusEnum` : supprimer `ConfigurationResponseDtoStatusEnum` et ne garder que `ConfigurationStandardDetailResponseDtoStatusEnum`
