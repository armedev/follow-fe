import Link from "next/link";

export default async function Page() {
  return (
    <>
      hello b
      <div>
        <Link href={"/follow/a"}>A</Link>
        <br />
        <Link href={"/follow"}>follow</Link>
      </div>
    </>
  );
}
