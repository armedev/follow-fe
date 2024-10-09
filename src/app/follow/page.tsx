"use client";

import { ChangeEvent, useEffect, useState } from "react";
import styles from "./follow.module.scss";
import { useRouter } from "next/navigation";
import { WS_LOCAL_STORAGE_UPDATE } from "../utils/constants";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [val, setVal] = useState("");

  useEffect(() => {
    const handleStorageUpdate = () => {
      const val = localStorage.getItem("hello");
      const storedVal = val != null ? JSON.parse(val) : "";
      setVal(storedVal || "");
    };

    handleStorageUpdate();

    window.addEventListener(WS_LOCAL_STORAGE_UPDATE, handleStorageUpdate);

    return () =>
      window.removeEventListener(WS_LOCAL_STORAGE_UPDATE, handleStorageUpdate);
  }, []);

  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    console.log("hello");
    setVal(e.target.value);
    localStorage.setItem("hello", JSON.stringify(e.target.value));
  };

  return (
    <div
      style={{
        backgroundColor: open ? "red" : "green",
        height: "500vh",
        position: "relative",
      }}
    >
      <div style={{ position: "sticky", top: "10px", left: "10px" }}>
        <button
          onClick={() => {
            console.log("clicked 1");
            setOpen(true);
          }}
        >
          red
        </button>
        <button
          onClick={() => {
            console.log("clicked 2");
            setOpen(false);
          }}
        >
          green
        </button>
        <button
          onClick={() => {
            console.log("clicked 3");
            router.push("/follow/a");
          }}
        >
          goto a
        </button>
        <button
          onClick={() => {
            console.log("clicked 4");
            router.push("/follow/b");
          }}
        >
          goto b
        </button>
        <button
          onClick={() => {
            console.log("clicked 5");
            setModalOpen(true);
          }}
        >
          show blue box
        </button>
        <button
          onClick={() => {
            console.log("clicked 6");
            setModalOpen(false);
          }}
        >
          hide blue box
        </button>
        <div>
          <label htmlFor="cars">Choose a car:</label>

          <select name="cars" id="cars" onChange={() => console.log("hello 3")}>
            <option value="volvo">Volvo</option>
            <option value="saab">Saab</option>
            <option value="mercedes">Mercedes</option>
            <option value="audi">Audi</option>
          </select>
        </div>
        <div>
          <input type="radio" id="html" name="fav_language" value="HTML" />
          <label htmlFor="html">HTML</label>
          <br />
          <input type="radio" id="css" name="fav_language" value="CSS" />
          <label htmlFor="css">CSS</label>
          <br />
          <input
            type="radio"
            id="javascript"
            name="fav_language"
            value="JavaScript"
          />
          <label htmlFor="javascript">JavaScript</label>
        </div>
        <div>
          <input type="number" />
          <textarea value={val} onChange={handleChange} />
        </div>
      </div>
      <div
        className={styles["modal"]}
        style={{ visibility: modalOpen ? "visible" : "hidden" }}
      ></div>
    </div>
  );
}
