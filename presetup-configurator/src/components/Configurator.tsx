import { useEffect, useState } from "react";
import yaml from "js-yaml";

import CopyCodeBlock from "./CopyCodeBlock";
import { LevelEntry, Levels } from "./Levels";
import { LogChannel, LogChannels } from "./LogChannels";

import "./Configurator.css";


export function Configurator() {
  const [prefix, setPrefix] = useState("!");
  const [levels, setLevels] = useState<LevelEntry[]>([]);

  const [withModCommands, setWithModCommands] = useState(false);
  const [muteRoleId, setMuteRoleId] = useState("");
  const [caseChannelId, setCaseChannelId] = useState("");
  const [dmModActionReasons, setDmModActionReasons] = useState(false);

  const [withLogs, setWithLogs] = useState(false);
  const [logChannels, setLogChannels] = useState<LogChannel[]>([]);

  const [result, setResult] = useState({});
  useEffect(() => {
    const resultObj: any = {
      prefix,
      levels: levels.reduce((obj, entry) => {
        obj[entry[0]] = entry[1];
        return obj;
      }, {}),
      plugins: {
        utility: {},
      },
    };

    if (withModCommands) {
      resultObj.plugins.cases = {
        config: {
          case_log_channel: caseChannelId,
        },
      };

      resultObj.plugins.mod_actions = {};

      if (muteRoleId) {
        resultObj.plugins.mutes = {
          config: {
            mute_role: muteRoleId,
          },
        };

        if (dmModActionReasons) {
          resultObj.plugins.mutes.config.dm_on_mute = true;
        }
      }

      if (dmModActionReasons) {
        resultObj.plugins.mod_actions = {
          config: {
            dm_on_warn: true,
            dm_on_kick: true,
            dm_on_ban: true,
          },
        };
      }
    }

    if (withLogs) {
      resultObj.plugins.logs = {
        config: {
          channels: logChannels.reduce((obj, logChannel) => {
            if (logChannel.includeExclude === "include") {
              obj[logChannel.id] = {
                include: Array.from(logChannel.logTypes.values()),
              };
            } else {
              obj[logChannel.id] = {
                exclude: Array.from(logChannel.logTypes.values()),
              };
            }
            return obj;
          }, {}),
        },
      };
    }

    setResult(resultObj);
  }, [prefix, levels, withModCommands, muteRoleId, caseChannelId, dmModActionReasons, withLogs, logChannels]);

  const [formattedResult, setFormattedResult] = useState("");
  useEffect(() => {
    let _formattedResult = yaml.dump(result);

    // Add line break before each unquoted top-level or second-level property
    _formattedResult = _formattedResult.replace(/^ {0,2}[a-z_]+:/gm, "\n$&").trim();

    // Add additional line break at the end
    _formattedResult += "\n";

    // Explain "exclude: []"
    _formattedResult = _formattedResult.replace(/exclude: \[]/, "$& # Exclude nothing = include everything");

    setFormattedResult(_formattedResult);
  }, [result]);


  return (
    <div className="Configurator">
      {/* Options */}
      <div className="options">
        <h2>Bot Prefix</h2>
        <div className="control">
          <label>
            <input value={prefix} onChange={(e) => setPrefix(e.target.value)} />
          </label>
        </div>

        <h2>Levels</h2>
        <div className="control">
          <Levels levels={levels} setLevels={setLevels} />
        </div>

        <h2>Mod commands</h2>
        <div className="control">
          <label>
            <input type="checkbox" checked={withModCommands} onChange={(e) => setWithModCommands(e.target.checked)} />
            Start with a basic mod command setup
          </label>

          {withModCommands && (
            <div>
              <label>
                Mute role ID
                <br />
                <input value={muteRoleId} onChange={(e) => setMuteRoleId(e.target.value)} />
              </label>

              <label>
                Case channel ID
                <br />
                <input value={caseChannelId} onChange={(e) => setCaseChannelId(e.target.value)} />
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={dmModActionReasons}
                  onChange={(e) => setDmModActionReasons(e.target.checked)}
                />
                DM reason with mod actions
              </label>
            </div>
          )}
        </div>

        <h2>Logs</h2>
        <div className="control">
          <label>
            <input type="checkbox" checked={withLogs} onChange={(e) => setWithLogs(e.target.checked)} />
            Start with a basic logging setup
          </label>

          {withLogs && <LogChannels logChannels={logChannels} setLogChannels={setLogChannels} />}
        </div>
      </div>

      <br />

      {/*/!* Result *!/*/}
      <div className="result">
        <CopyCodeBlock
          code={formattedResult}
          language={"yaml"}
        />
      </div>
    </div>
  );
}
