import { describe, expect, test, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { use3dModels } from '../../../src/hooks/use3dModels';
import { CogniteCadModel, type CogniteModel } from '@cognite/reveal';
import { renderHook } from '@testing-library/react';

import { viewerMock, viewerModelsMock } from '../fixtures/viewer';
import { cadMock, cadModelOptions } from '../fixtures/cadModel';
import { Mock } from 'moq.ts';
import { Matrix4 } from 'three';

const mockResourceCount = { reveal3DResourcesCount: 2 };

vi.mock('../../../src/components/RevealCanvas/ViewerContext', () => ({
  useReveal: () => viewerMock
}));

vi.mock('../../../src/components/Reveal3DResources/Reveal3DResourcesInfoContext', () => ({
  useReveal3DResourcesCount: () => mockResourceCount
}));

describe('use3dModels', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('returns models from viewer', () => {
    const mockModels: CogniteModel[] = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);

    const { result } = renderHook(() => use3dModels());

    expect(result.current).toEqual(mockModels);
  });

  test('updates models when viewer or resourceCount changes', () => {
    const mockModels: CogniteModel[] = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);

    const { result, rerender } = renderHook(() => use3dModels());

    expect(result.current).toEqual(mockModels);

    const newCadModelOptions = {
      modelId: 987,
      revisionId: 654
    };

    const newCadMock = new Mock<CogniteCadModel>()
      .setup((p) => p.modelId)
      .returns(newCadModelOptions.modelId)
      .setup((p) => p.revisionId)
      .returns(newCadModelOptions.revisionId)
      .setup((p) => p.getModelTransformation())
      .returns(new Matrix4())
      .object();

    const newMockModels: CogniteModel[] = [newCadMock, newCadMock];
    const newMockResourceCount = { reveal3DResourcesCount: 3 };

    viewerModelsMock.mockReturnValue(newMockModels);
    mockResourceCount.reveal3DResourcesCount = newMockResourceCount.reveal3DResourcesCount;

    rerender();

    expect(result.current).toEqual(newMockModels);
  });
});
