"use client";
import Link from "next/link";

export default function Page() {
  return (
    <>
      hello a
      <div>
        <Link href={"/follow/b"}>B</Link>
        <br />
        <Link href={"/follow"}>follow</Link>
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
      </div>
    </>
  );
}
