"use client";
import FollowButton from "./components/followButton";
import FollowProvider from "../contexts/follow";
import styles from "./follow.module.scss";

export default function FollowLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FollowProvider>
      <div className={styles["layout"]}>
        <div className={styles["navbar"]}>
          <FollowButton leaderLabel="make leader" clientLabel="make client" />
        </div>
        <div className={styles["body"]}>{children}</div>
      </div>
    </FollowProvider>
  );
}
