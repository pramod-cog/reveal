/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useCallback } from 'react';
import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { useCameraNavigation } from '../../hooks/useCameraNavigation';
import { useSceneDefaultCamera } from '../../hooks/useSceneDefaultCamera';
import { useReveal } from '../RevealCanvas/ViewerContext';

type ResetCameraButtonProps = {
  sceneExternalId?: string;
  sceneSpaceId?: string;
};

export const ResetCameraButton = ({
  sceneExternalId,
  sceneSpaceId
}: ResetCameraButtonProps): ReactElement => {
  const { t } = useTranslation();
  const viewer = useReveal();
  const cameraNavigation = useCameraNavigation();
  const resetToDefaultSceneCamera = useSceneDefaultCamera(sceneExternalId, sceneSpaceId);

  const resetCameraToHomePosition = useCallback(() => {
    if (viewer.get360ImageCollections() !== undefined) {
      viewer.exit360Image();
    }
    if (sceneExternalId !== undefined && sceneSpaceId !== undefined) {
      resetToDefaultSceneCamera.fitCameraToSceneDefault();
      return;
    }
    cameraNavigation.fitCameraToAllModels();
  }, [sceneExternalId, sceneSpaceId, cameraNavigation, resetToDefaultSceneCamera, viewer]);

  return (
    <CogsTooltip
      content={t('RESET_CAMERA_TO_HOME', 'Reset camera to home')}
      placement="right"
      appendTo={document.body}>
      <Button
        type="ghost"
        icon="Home"
        aria-label="Reset camera to home"
        onClick={resetCameraToHomePosition}
      />
    </CogsTooltip>
  );
};
