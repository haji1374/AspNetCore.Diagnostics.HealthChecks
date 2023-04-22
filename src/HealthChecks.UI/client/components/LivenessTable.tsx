import React, { FunctionComponent, useState } from 'react';
import { Liveness } from '../typings/models';
import { discoveryServices, getStatusConfig } from '../healthChecksResources';
import { CheckTable } from './CheckTable';
import { Switch } from 'react-router-dom';

interface LivenessTableProps {
  livenessData: Array<Liveness>;
  collapseAll: (event: any) => void;
  expandAll: (event: any) => void;
}

const LivenessTable: FunctionComponent<LivenessTableProps> = ({ livenessData, expandAll, collapseAll }) => {

  const [searchedVal, setSearchedVal] = useState("");
  const [sortVal, setSortVal] = useState("");

  const mapTable = (livenessData: Array<Liveness>): Array<Liveness> => {
    return livenessData.map(liveness => {
      if (liveness.livenessResult) {
        let checks;
        try {
          //Check whether liveness result is an string formatted Array or a simple string
          checks = JSON.parse(liveness.livenessResult).checks;
          Object.assign(liveness, { checks });
        } catch (err) {
          Object.assign(liveness, { checks: liveness.livenessResult });
        }
      }
      return liveness;
    });
  };

  const toggleAll = (event: any) => {
    let { currentTarget } = event;
    let iconToggle = currentTarget.getElementsByClassName('js-toggle-all')[0];
    const innerValue = iconToggle.innerHTML;

    if (innerValue == 'add_circle_outline') {
      iconToggle.innerHTML = 'remove_circle_outline';
      currentTarget.setAttribute('title', 'close all');
      return expandAll(event);
    } else {
      iconToggle.innerHTML = 'add_circle_outline';
      currentTarget.setAttribute('title', 'expand all');
      return collapseAll(event);
    }
  }

  return (
    <div>
      <input className="my-input" onChange={(e) => setSearchedVal(e.target.value)} placeholder="Search" />
      <table className="hc-table">
        <thead className="hc-table__head">
          <tr>
            <th>
              <button title="expand all" onClick={e => toggleAll(e)}>
                <i className="material-icons js-toggle-all">
                  add_circle_outline
                </i>
              </button>
            </th>
            <th>Name</th>
            <th>
              <button onClick={(e) => sortVal === "ascending" ? setSortVal("descending") : setSortVal("ascending")}>
                Health
              </button>
            </th>
            <th>On state from</th>
            <th>Last execution</th>
          </tr>
        </thead>
        <tbody className="hc-table__body">
          {mapTable(livenessData).filter((row) => !searchedVal.length || row.name
            .toString()
            .toLowerCase()
            .includes(searchedVal.toString().toLowerCase())
            || row.entries.some(a => a.name
              .toString()
              .toLowerCase()
              .includes(searchedVal.toString().toLowerCase()))
            || row.entries.some(a => a.tags.some(i => i
              .toString()
              .toLowerCase()
              .includes(searchedVal.toString().toLowerCase())))
          ).sort((a, b) => calculateSort(a, sortVal) - calculateSort(b, sortVal)).map((item, index) => {
            const statusConfig = getStatusConfig(item.status);
            return (
              <React.Fragment key={index}>
                <tr
                  className="hc-table__row"
                  onClick={toggleVisibility}>
                  <td className="align-center">
                    <i
                      className="material-icons js-toggle-event"
                      title="expand info">
                      add
                    </i>
                  </td>
                  <td>
                    {getDiscoveryServiceImage(item.discoveryService)}
                    {item.name}
                  </td>
                  <td className="align-center">
                    <i
                      className="material-icons"
                      style={{
                        paddingRight: '0.5rem',
                        color: `var(${statusConfig!.color})`
                      }}>
                      {statusConfig!.image}
                    </i>
                  </td>
                  <td>{item.onStateFrom}</td>
                  <td className="align-center">
                    {new Date(item.lastExecuted).toLocaleString()}
                  </td>
                </tr>
                <tr className="hc-checks-table-container is-hidden">
                  <td colSpan={5}>
                    <CheckTable checks={item.entries.filter(a => !searchedVal.length ||
                      item.name
                        .toString()
                        .toLowerCase()
                        .includes(searchedVal.toString().toLowerCase()) ||
                      a.name
                        .toString()
                        .toLowerCase()
                        .includes(searchedVal.toString().toLowerCase()) ||
                      a.tags.some(a => a
                        .toString()
                        .toLowerCase()
                        .includes(searchedVal.toString().toLowerCase()))
                    )} history={item.history} />
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const getDiscoveryServiceImage = (discoveryService: string) => {
  if (discoveryService != null) {
    let discoveryServiceImage = discoveryServices.find(
      ds => ds.name === discoveryService
    )!.image;
    return (
      <img
        className="discovery-icon"
        src={discoveryServiceImage}
        title="Kubernetes discovered liveness"
      />
    );
  }

  return null;
}

const toggleVisibility = (event: any) => {
  let { currentTarget } = event;
  let checksTable = currentTarget.nextSibling;
  let isHidden = checksTable.classList.contains('is-hidden');
  isHidden
    ? checksTable.classList.remove('is-hidden')
    : checksTable.classList.add('is-hidden');

  let iconImage = currentTarget.getElementsByClassName('js-toggle-event')[0];
  iconImage.innerHTML = isHidden ? 'remove' : 'add';
  iconImage.setAttribute('title', isHidden ? 'hide info' : 'expand info');
};

function calculateSort(item: Liveness, sortVal: string): number {
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

export { LivenessTable };
