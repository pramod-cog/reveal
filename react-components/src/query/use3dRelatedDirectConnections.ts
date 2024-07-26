/*!
 * Copyright 2023 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdm3dDataProvider, useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { type Source, type DmsUniqueIdentifier } from '../data-providers/FdmSDK';
import assert from 'assert';
import { type FdmInstanceWithView } from '../data-providers/types';

export function use3dRelatedDirectConnections(
  instance: DmsUniqueIdentifier | undefined
): UseQueryResult<FdmInstanceWithView[]> {
  const fdmSdk = useFdmSdk();
  const fdmDataProvider = useFdm3dDataProvider();

  return useQuery({
    queryKey: ['reveal-react-components', 'get-3d-related-direct-connections'],
    queryFn: async () => {
      assert(instance !== undefined);
      const views = await fdmSdk.inspectInstances({
        inspectionOperations: { involvedViews: {} },
        items: [{ instanceType: 'node', ...instance }]
      });

      const view = views.items[0].inspectionResults.involvedViews[0];
      const instanceContent = (
        await fdmSdk.getByExternalIds<Record<string, unknown>>(
          [{ instanceType: 'node', ...instance }],
          view
        )
      ).items[0];

      const directlyRelatedObjects = Object.values(instanceContent.properties).flatMap(
        (spaceScope) =>
          Object.values(spaceScope).flatMap((fieldValues) =>
            Object.values(fieldValues).filter(
              (value: any): value is DmsUniqueIdentifier =>
                value.externalId !== undefined && value.space !== undefined
            )
          )
      );

      if (directlyRelatedObjects.length === 0) {
        return [];
      }

      const relatedObjectInspectionsResult = await fdmSdk.inspectInstances({
        inspectionOperations: { involvedViews: {} },
        items: directlyRelatedObjects.map((fdmId) => ({ ...fdmId, instanceType: 'node' }))
      });

      const relatedObjectsViewLists = relatedObjectInspectionsResult.items.map(
        (item) => item.inspectionResults.involvedViews
      );

      const relatedObjectViewsWithObjectIndex = relatedObjectsViewLists
        .map((viewList, objectInd) => viewList.map((view) => [objectInd, view] as const))
        .flat();

      const [deduplicatedViews, viewToDeduplicatedIndexMap] = createDeduplicatediewToIndexMap(
        relatedObjectViewsWithObjectIndex
      );

      const viewProps = await fdmSdk.getViewsByIds(deduplicatedViews);

      const threeDRelatedViews = relatedObjectViewsWithObjectIndex.filter(([_, view]) => {
        const viewResultIndex = viewToDeduplicatedIndexMap.get(createViewKey(view));
        assert(viewResultIndex !== undefined);
        const propsForView = viewProps.items[viewResultIndex];
        return fdmDataProvider.is3dView(propsForView);
      });

      return threeDRelatedViews.map(([index, view]) => ({
        ...directlyRelatedObjects[index],
        view
      }));
    },
    enabled: instance !== undefined
  });
}

type ViewKey = `${string}/${string}/${string}`;

function createViewKey(source: Source): ViewKey {
  return `${source.externalId}/${source.space}/${source.version}`;
}

function createDeduplicatediewToIndexMap(
  viewsWithObjectIndex: Array<readonly [number, Source]>
): [Source[], Map<ViewKey, number>] {
  const deduplicatedViews: Source[] = [];
  const viewToDeduplicatedIndexMap = new Map<ViewKey, number>();
  viewsWithObjectIndex.forEach(([_index, view]) => {
    const viewKey = createViewKey(view);
    const deduplicatedIndex = viewToDeduplicatedIndexMap.get(viewKey);

    if (deduplicatedIndex === undefined) {
      viewToDeduplicatedIndexMap.set(viewKey, deduplicatedViews.length);
      deduplicatedViews.push(view);
    }
  });

  return [deduplicatedViews, viewToDeduplicatedIndexMap];
}
