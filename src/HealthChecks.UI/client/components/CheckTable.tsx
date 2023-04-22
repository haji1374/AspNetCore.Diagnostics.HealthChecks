import React, { useEffect, useState } from "react";
import { Check, ExecutionHistory } from "../typings/models";
import { LivenessDetail } from "./LivenessDetail";
import { LivenessPanel } from "./LivenessPanel";
import { Status } from "./Status";

type Props = {
  checks: Check[];
  history: ExecutionHistory[];
};

const CheckTable = ({ checks, history }: Props) => {
  const [isOpenPanel, setOpenPanel] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] = useState<
    ExecutionHistory[] | null
  >(null);
  const [selectedHealthcheck, setSelectedHealthcheck] = useState<Check | null>(
    null
  );

  const [sortVal, setSortedVal] = useState("");

  const openPanel = (healthCheck: Check, history: ExecutionHistory[]) => {
    setOpenPanel(true);
    setSelectedHistory(history);
    setSelectedHealthcheck(healthCheck);
  };

  useEffect(() => {
    const interval = !isOpenPanel
      ? setTimeout(() => {
        setSelectedHealthcheck(null);
        setSelectedHistory(null);
      }, 200)
      : 0;

    return () => {
      if (interval != 0) clearInterval(interval);
    };
  }, [isOpenPanel]);

  const renderTable = () => {
    return !Array.isArray(checks) ? (
      <tr>
        <td colSpan={5}>{checks}</td>
      </tr>
    ) : (
      checks.sort((a, b) => calculateSort(a, sortVal) - calculateSort(b, sortVal)).map((item, index) => {
        const tags = item.tags
          ? item.tags.map((tag) => <span className="tag">{tag}</span>)
          : null;

        return (
          <tr key={index}>
            <td>{item.name}</td>
            <td>{tags}</td>
            <td>
              <Status status={item.status}></Status>
            </td>
            <td>{item.description}</td>
            <td className="align-center">{item.duration.toString()}</td>
            <td>
              <button
                className="hc-action-btn"
                onClick={() =>
                  openPanel(
                    item,
                    history.filter(
                      (historyElement) => historyElement.name == item.name
                    )
                  )
                }
              >
                <i className="material-icons">history</i>
              </button>
            </td>
          </tr>
        );
      })
    );
  };

  return (
    <>
      <table className="hc-checks-table">
        <thead className="hc-checks-table__header">
          <tr>
            <th style={{ width: "20%" }}>Name</th>
            <th style={{ width: "10%" }}>Tags</th>
            <th style={{ width: "10%" }}>
              <button onClick={(e) => sortVal === "ascending" ? setSortedVal("descending") : setSortedVal("ascending")}>
                Health
              </button>
            </th>
            <th style={{ width: "30%" }}>Description</th>
            <th style={{ width: "20%" }}>Duration</th>
            <th style={{ width: "10%" }}>Details</th>
          </tr>
        </thead>
        <tbody className="hc-checks-table__body">{renderTable()}</tbody>
      </table>
      <LivenessPanel
        visible={isOpenPanel}
        onClosePanel={() => setOpenPanel(false)}
      >
        <LivenessDetail
          healthcheck={selectedHealthcheck!}
          executionHistory={selectedHistory!}
        ></LivenessDetail>
      </LivenessPanel>
    </>
  );
};

function calculateSort(item: Check, sortVal: string): number {
  if (sortVal === 'ascending') {
    switch (item.status.toLowerCase()) {
      case "healthy":
        return 0;
        break;
      case "unhealthy":
        return 2;
        break;
      default:
        return 1;
    }
  }
  else {
    switch (item.status.toLowerCase()) {
      case "healthy":
        return 2;
        break;
      case "unhealthy":
        return 0;
        break;
      default:
        return 1;
    }
  }
}

export { CheckTable };
