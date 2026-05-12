"use client";
import {
  Configuration,
  getDefaultConfiguration,
  getDefaultState,
} from "@/lib/types/data";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.scss";

const Digit = ({
  value,
  id,
  configuration,
}: {
  value: string;
  id: string;
  configuration: Configuration;
}) => (
  <div className={styles.digitWrapper}>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={`${id}-${value}`}
        style={{
          color: configuration.primaryColor,
        }}
        initial={{ y: "20%", opacity: 0, filter: "blur(20px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        exit={{ y: "-20%", opacity: 0, filter: "blur(20px)" }}
        transition={{ duration: 0.4, ease: [0.66, 0, 0.34, 1] }}
        className={styles.digit}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </div>
);

export default function LobbyDisplay() {
  const [data, setData] = useState(getDefaultState());
  const [configuration, setConfiguration] = useState(getDefaultConfiguration());
  const [seconds, setSeconds] = useState(0);
  const [lastChime, setLastChime] = useState(-1);

  const textLength = configuration.showName?.length || 1;
  const scalar = Math.min(20, 120 / textLength);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      const json = await res.json();
      setData(json);
      if (json.config) {
        setConfiguration(json.config);
        document.documentElement.style.setProperty(
          "--primary-color",
          json.config.primaryColor,
        );
        document.documentElement.style.setProperty(
          "--secondary-color",
          json.config.secondaryColor,
        );
        document.documentElement.style.setProperty(
          "--gradient-color",
          json.config.gradientColor,
        );
      }
      setSeconds(json.seconds);

      if (json.config) {
        setConfiguration(json.config);
      }

      if (json.shouldChime && lastChime !== json.seconds) {
        const audio = new Audio("/chime.mp3");
        audio.play();
        setLastChime(json.seconds);

        setTimeout(() => {
          setLastChime(-1);
        }, 1000);
      }
    } catch (error) {
      console.error(error);
    }
  }, [lastChime]);

  useEffect(() => {
    queueMicrotask(async () => {
      await fetchData();
    });

    const poll = setInterval(async () => {
      await fetchData();
    }, 200);
    return () => clearInterval(poll);
  }, [lastChime, fetchData]);

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {data.view === "splash" && configuration.showName ? (
          <motion.div
            key="splash"
            className={styles.screen}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 1.2 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.h1
                className={styles.title}
                style={
                  {
                    "--text-scalar": `${scalar}cqw`,
                  } as React.CSSProperties
                }
              >
                {configuration.showName}
              </motion.h1>
              <motion.p
                key={configuration.splash + "-subtitle"}
                initial={{ y: "20%", opacity: 0, filter: "blur(20px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: "-20%", opacity: 0, filter: "blur(20px)" }}
                transition={{ duration: 0.4, ease: [0.66, 0, 0.34, 1] }}
                className={styles.label}
              >
                {configuration.splash}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="intermission"
            className={styles.screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence mode="wait">
              {seconds >= 0 && configuration.showName ? (
                <motion.div
                  key="intermission"
                  className={styles.screen}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 1.2 }}
                >
                  <h2 className={styles.label}>INTERMISSION</h2>
                  <div className={styles.clock}>
                    <div className={styles.minutesArea}>
                      {Math.floor(seconds / 60)
                        .toString()
                        .padStart(2, "0")
                        .split("")
                        .map((char, i) => (
                          <Digit
                            key={`min-${i}`}
                            id={`min-${i}`}
                            value={char}
                            configuration={configuration}
                          />
                        ))}
                    </div>

                    <span
                      className={styles.separator}
                      style={{
                        color: configuration.primaryColor,
                      }}
                    >
                      :
                    </span>

                    <div className={styles.secondsArea}>
                      {(seconds % 60)
                        .toString()
                        .padStart(2, "0")
                        .split("")
                        .map((char, i) => (
                          <Digit
                            key={`sec-${i}`}
                            id={`sec-${i}`}
                            value={char}
                            configuration={configuration}
                          />
                        ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="intermission-ended"
                  className={styles.screen}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 1.2 }}
                >
                  <h2 className={styles.label}>PLEASE TAKE YOUR SEATS</h2>
                  <div className={styles.startingSoon}>STARTING SOON</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
