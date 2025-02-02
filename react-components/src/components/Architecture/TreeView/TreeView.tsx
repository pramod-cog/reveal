/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement } from 'react';
import { type TreeViewProps } from './TreeViewProps';
import { TreeViewNode } from './TreeViewNode';
import { getChildrenAsArray } from './utilities/getChildrenAsArray';
import { BACKGROUND_COLOR } from './utilities/constants';

export const TreeView = (props: TreeViewProps): ReactElement => {
  const id = 'treeView';
  const nodes = getChildrenAsArray(props.root, props.loadNodes, false);
  if (nodes === undefined) {
    return <></>;
  }
  return (
    <div
      id={id}
      style={{
        backgroundColor: props.backgroundColor ?? BACKGROUND_COLOR
      }}>
      {nodes.map((node, index) => (
        <TreeViewNode node={node} key={index} level={0} props={props} />
      ))}
    </div>
  );
};
