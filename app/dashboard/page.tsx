"use client";
import { getDefaultConfiguration, getDefaultState } from "@/lib/types/data";
import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.scss";

export default function Dashboard() {
  const [customTime, setCustomTime] = useState(15);
  const [serverState, setServerState] = useState(getDefaultState());

  const [configuration, setConfiguration] = useState(getDefaultConfiguration());
  const [inputFocus, setInputFocus] = useState(false);

  const [textInput, setTextInput] = useState("");
  const [hasSetConfig, setHasSetConfig] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [now, setNow] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      const json = await res.json();
      setServerState(json);
      setLastUpdated(new Date());

      if (json.config && !inputFocus) {
        setConfiguration(json.config);

        if (!hasSetConfig) {
          setTextInput(json.config.splash);
          setHasSetConfig(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [inputFocus, hasSetConfig]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchData();
    });

    setInterval(() => {
      setNow(new Date());
    }, 500);
    const poll = setInterval(async () => {
      await fetchData();
    }, 500);

    return () => clearInterval(poll);
  }, [hasSetConfig, inputFocus, fetchData]);

  const updateState = (payload: object) => {
    fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => {
      fetchData();
    });
  };

  const formatTime = (s: number) => {
    const displaySecs = Math.max(0, s);
    const m = Math.floor(displaySecs / 60)
      .toString()
      .padStart(2, "0");
    const sec = (displaySecs % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const isConnected = now.getTime() - lastUpdated.getTime() < 1000;

  return (
    <div className={styles.fullWrapper}>
      <div className={styles.header}>
        <div
          className={`${styles.statusItem} ${styles.right} ${hasSetConfig ? "" : styles.loading}`}
        >
          <span>CURRENT VIEW</span>
          <strong
            className={
              serverState.view === "intermission" ? styles.activeText : ""
            }
          >
            {serverState.view.toUpperCase()}
          </strong>
        </div>

        {serverState.view === "intermission" && (
          <div className={`${styles.statusItem} ${styles.timer}`}>
            <span>LOBBY CLOCK</span>
            <strong className={styles.clockText}>
              {formatTime(serverState.seconds)}
            </strong>
          </div>
        )}

        <div className={styles.statusContainer}>
          <span>
            {" "}
            {!isConnected ? (
              <span className={styles.secondaryText}>
                Last updated{" "}
                {lastUpdated && isConnected
                  ? "just now."
                  : `${Math.floor((now.getTime() - lastUpdated.getTime()) / 1000)}s ago`}
              </span>
            ) : (
              "CONNECTION STATUS"
            )}
          </span>

          <span
            className={`${
              isConnected ? styles.connectionText : styles.disconnectedText
            }`}
          >
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </div>

      <div
        className={styles.wrapper}
        style={{
          opacity: isConnected ? 1 : 0.5,
          pointerEvents: isConnected ? "unset" : "none",
        }}
      >
        <div className={styles.section}>
          <h3>Scene Control</h3>
          <div className={styles.grid}>
            <button
              className={`${styles.btn} ${styles.warn} ${serverState.view == "splash" ? styles.disabled : ""}`}
              onClick={() =>
                updateState({ view: "splash", timerActive: false })
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#2b2b2b"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.backIcon}
              >
                <path d="M5 22h14"></path>
                <path d="M5 2h14"></path>
                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
              </svg>
              <p>ACTIVATE SPLASH</p>
            </button>
            <button
              className={`${styles.btn} ${styles.warn} ${serverState.view == "live" ? styles.disabled : ""}`}
              onClick={() =>
                updateState({
                  view: "live",
                })
              }
            >
              <svg
                fill="#2b2b2b"
                height="24px"
                width="24px"
                version="1.1"
                id="Icons"
                viewBox="0 0 32 32"
                className={styles.backIcon}
              >
                <path
                  d="M29.5,14.1c-0.3-0.2-0.7-0.2-1,0l-4.6,2.3C23.7,15,22.5,14,21,14H7c-1.7,0-3,1.3-3,3v6c0,1.7,1.3,3,3,3h5.1l-3,4.4
	c-0.3,0.5-0.2,1.1,0.3,1.4c0.5,0.3,1.1,0.2,1.4-0.3l3.2-4.8l3.2,4.8c0.2,0.3,0.5,0.4,0.8,0.4c0.2,0,0.4-0.1,0.6-0.2
	c0.5-0.3,0.6-0.9,0.3-1.4l-3-4.4H21c1.5,0,2.7-1,2.9-2.4l4.6,2.3C28.7,26,28.8,26,29,26c0.2,0,0.4-0.1,0.5-0.1
	c0.3-0.2,0.5-0.5,0.5-0.9V15C30,14.7,29.8,14.3,29.5,14.1z"
                />
                <path
                  d="M19,1c-2.1,0-3.9,1.1-5,2.7C12.9,2.1,11.1,1,9,1C5.7,1,3,3.7,3,7s2.7,6,6,6c2.1,0,3.9-1.1,5-2.7c1.1,1.6,2.9,2.7,5,2.7
	c3.3,0,6-2.7,6-6S22.3,1,19,1z M9,9C7.9,9,7,8.1,7,7s0.9-2,2-2s2,0.9,2,2S10.1,9,9,9z M19,9c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2
	S20.1,9,19,9z"
                />
              </svg>
              <p>GO LIVE</p>
            </button>
            <button
              className={`${styles.btn} ${styles.warn}`}
              onClick={() =>
                updateState({
                  view: "intermission",
                  timerActive: true,
                  action: "set",
                  value: configuration.intermissionLength * 60,
                })
              }
            >
              {serverState.view === "intermission" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.backIcon}
                >
                  <path d="M10 2h4"></path>
                  <path d="M12 14v-4"></path>
                  <path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"></path>
                  <path d="M9 17H4v5"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.backIcon}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              )}
              <p>
                {serverState.view === "intermission"
                  ? "RESTART INTERMISSION"
                  : "START INTERMISSION"}
              </p>
            </button>
            <button
              className={`${styles.btn} ${styles.warn} ${serverState.view != "intermission" || serverState.seconds <= 0 ? styles.disabled : ""}`}
              onClick={() =>
                updateState({
                  view: "intermission",
                  timerActive: false,
                  action: "set",
                  value: 0,
                })
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.backIcon}
              >
                <path d="M10 2h4"></path>
                <path d="M4.6 11a8 8 0 0 0 1.7 8.7 8 8 0 0 0 8.7 1.7"></path>
                <path d="M7.4 7.4a8 8 0 0 1 10.3 1 8 8 0 0 1 .9 10.2"></path>
                <path d="m2 2 20 20"></path>
                <path d="M12 12v-2"></path>
              </svg>
              <p>END INTERMISSION</p>
            </button>
          </div>
          <div className={styles.input}>
            <input
              type="text"
              placeholder="Custom lobby text"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setConfiguration({
                    ...configuration,
                    splash: textInput,
                  });
                  updateState({
                    action: "updateConfig",
                    value: { splash: textInput },
                  });

                  setInputFocus(false);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <div>
              <button
                className={`${styles.btn} ${styles.submitBtn}`}
                onClick={() => {
                  setConfiguration({
                    ...configuration,
                    splash: textInput,
                  });
                  updateState({
                    action: "updateConfig",
                    value: { splash: textInput },
                  });
                }}
              >
                SET SPLASH
              </button>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Timer Control</h3>
          <div className={styles.timerControls}>
            <div className={styles.adjustButtons}>
              <button
                className={styles.btn}
                onClick={() => updateState({ action: "adjust", value: 60 })}
              >
                +1 MIN
              </button>
              <button
                className={styles.btn}
                onClick={() => updateState({ action: "adjust", value: -60 })}
              >
                -1 MIN
              </button>
            </div>

            <div className={styles.input}>
              <input
                type="number"
                placeholder="15"
                inputMode="numeric"
                pattern="[0-9]*"
                value={customTime}
                onChange={(e) => setCustomTime(parseInt(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateState({ action: "set", value: customTime * 60 });

                    setInputFocus(false);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
              <div>
                <button
                  className={`${styles.btn} ${styles.submitBtn}`}
                  onClick={() => {
                    updateState({ action: "set", value: customTime * 60 });
                  }}
                >
                  SET TIME
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Show Configuration</h3>
          <div className={styles.flex}>
            <div className={styles.configItem}>
              <label>Show Name</label>
              <input
                type="text"
                value={configuration.showName}
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
                onChange={(e) => {
                  setConfiguration({
                    ...configuration,
                    showName: e.target.value,
                  });
                  updateState({
                    action: "updateConfig",
                    value: { showName: e.target.value },
                  });
                }}
              />
            </div>
            <div className={styles.configItem}>
              <label>Intermission Length (minutes)</label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={configuration.intermissionLength}
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
                onChange={(e) => {
                  setConfiguration({
                    ...configuration,
                    intermissionLength: parseInt(e.target.value),
                  });
                  updateState({
                    action: "updateConfig",
                    value: { intermissionLength: parseInt(e.target.value) },
                  });
                }}
              />
            </div>
            <div className={styles.configItem}>
              <label>Primary Color</label>
              <input
                type="color"
                value={configuration.primaryColor}
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
                className={styles.colorInput}
                onChange={(e) => {
                  setConfiguration({
                    ...configuration,
                    primaryColor: e.target.value,
                  });
                  updateState({
                    action: "updateConfig",
                    value: { primaryColor: e.target.value },
                  });
                }}
              />
            </div>
            <div className={styles.configItem}>
              <label>Secondary Color</label>
              <input
                type="color"
                value={configuration.secondaryColor}
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
                className={styles.colorInput}
                onChange={(e) => {
                  setConfiguration({
                    ...configuration,
                    secondaryColor: e.target.value,
                  });
                  updateState({
                    action: "updateConfig",
                    value: { secondaryColor: e.target.value },
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
