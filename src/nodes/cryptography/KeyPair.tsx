import React, { useEffect } from "react";
import {
  NodeProps,
  Handle,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import Web3 from "web3";

import { Utf8DataTransfer } from "../../Utf8DataTransfer";

export interface KeyPairNodeProps extends NodeProps {
  id: string;
  data: {
    in?: object;
    out?: {
      publicKey?: string;
      privateKey?: string;
      address?: string;
    };
  };
}

const KeyPairNode: React.FC<KeyPairNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  
  // Detect input connections (e.g., receiving a private key from another node)
  const inputConnections = useNodeConnections({ handleType: 'target' });
  const nodesData = useNodesData(inputConnections[0]?.source);
  
  // Detect output connections (which nodes are connected to which handles)
  const outputConnections = useNodeConnections({ handleType: 'source' });

  // Web3 setup
  const web3 = new Web3();
  const privateKey = nodesData ? Utf8DataTransfer.unpack(nodesData?.data.out as string) as string : "";
  const account = privateKey ? web3.eth.accounts.privateKeyToAccount(privateKey) : null;
  const publicKey = privateKey && account ? web3.eth.accounts.privateKeyToPublicKey(account.privateKey, false) : "";
  const address = privateKey && account ? account.address : "";

  useEffect(() => {
    const pkOut = Utf8DataTransfer.encodeString(privateKey);
    const pubOut = Utf8DataTransfer.encodeString(publicKey);
    const addrOut = Utf8DataTransfer.encodeString(address);
    updateNodeData(id, { ...data, out: { privateKey: pkOut, publicKey: pubOut, address: addrOut } });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privateKey, outputConnections.length]);

  return (
    <div style={{ padding: 8, border: "1px solid #ccc", minWidth: 220 }}>
      <div>Ethereum KeyPair Node (Web3.js)</div>
      <p style={{ marginTop: 8 }}>
        <strong>Public Address:</strong>
        <br />
        <span>{publicKey || "Generating..."}</span>
      </p>
      <p style={{ marginTop: 8 }}>
        <strong>Private Key:</strong>
        <br />
        <span>{privateKey || "Generating..."}</span>
      </p>

      <Handle type="target" position={Position.Left} id="input" isConnectable={inputConnections.length === 0} />

      <Handle
        type="source"
        position={Position.Right}
        id="publicKey"
        style={{ top: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="privateKey"
        style={{ top: "60%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="address"
        style={{ top: "90%" }}
      />
    </div>
  );
};

const MemoizedKeyPairNode = React.memo(KeyPairNode);
export default MemoizedKeyPairNode;
