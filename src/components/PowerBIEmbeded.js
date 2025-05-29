import React, { useState } from "react";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import reportList from "../reports.json";
import "./powerbi.css";

const PowerBIEmbeded = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [hasError, setHasError] = useState(false);

  const handleClick = (report) => {
    setHasError(false);
    setSelectedReport(report);
  };

  return (
    <div className="report-selection">
      <h2>Select a Report</h2>
      <ul className="report-list">
        {reportList.map((report) => (
          <li key={report.id} onClick={() => handleClick(report)}>
            {report.name}
          </li>
        ))}
      </ul>

      {selectedReport && !hasError && (
        <div className="report-container" key={selectedReport.id}>
          <PowerBIEmbed
            embedConfig={{
              type: "report",
              id: selectedReport.id,
              embedUrl: selectedReport.embedUrl,
              tokenType: models.TokenType.Embed,
              settings: {
                panes: {
                  filters: { visible: false },
                  pageNavigation: { visible: true },
                },
              },
            }}
            eventHandlers={new Map([
              ["loaded", () => {
                console.log("Report loaded");
                setHasError(false);
              }],
              ["rendered", () => console.log("Report rendered")],
              ["error", (event) => {
                console.error("Embed error:", event.detail);
                setHasError(true);
              }],
            ])}
            cssClassName={"report-style-class"}
            getEmbeddedComponent={(report) =>
              console.log("Embedded Report instance", report)
            }
          />
        </div>
      )}

      {hasError && (
        <div className="error-message">
          ⚠️ Unable to load the selected report. Please check the embed URL or report access.
        </div>
      )}
    </div>
  );
};

export default PowerBIEmbeded;
