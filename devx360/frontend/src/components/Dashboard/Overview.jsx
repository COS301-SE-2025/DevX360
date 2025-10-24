import React from 'react';
import StatCard from '../common/StatCard';
import HeaderInfo from "../common/HeaderInfo";

function Overview() {

  return (
    <div
      className="p-6 space-y-10 min-h-screen"
      style={{
        background: "var(--bg)",
        color: "var(--text)"
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 shadow-sm border-b"
        style={{
          background: "var(--bg-container)",
          borderColor: "var(--border)"
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                DevX360
              </h1>
              <div
                className="h-6 w-px"
                style={{ background: "var(--border)" }}
              ></div>
              <p className="text-lg font-medium" style={{ color: "var(--text-light)" }}>
                Overview
              </p>
            </div>
            <HeaderInfo />
          </div>
        </div>
      </header>

      {/* Welcome card */}
      <div
        className="shadow-xl rounded-3xl p-10 border hover:shadow-2xl transition transform hover:-translate-y-1"
        style={{
          background: "var(--bg-container)",
          borderColor: "var(--border)",
          color: "var(--text)"
        }}
      >
        <h2 className="text-3xl font-extrabold mb-4 tracking-tight" style={{ color: "var(--text)" }}>
          ✨ Welcome to DevX360
        </h2>
        <p className="leading-relaxed text-lg max-w-3xl" style={{ color: "var(--text-light)" }}>
          Your <span style={{ color: "var(--primary)", fontWeight: "600" }}>engineering intelligence platform</span>, 
          crafted to help you <span className="italic">measure</span>, <span className="italic">analyze</span>, 
          and <span className="italic">improve</span> your team's performance. Unlock success with 
          <span style={{ color: "var(--primary-dark)", fontWeight: "600" }}> DORA metrics</span> and actionable AI-driven insights.
        </p>
      </div>

      {/* About card */}
      <div
        className="shadow-xl rounded-3xl p-10 border hover:shadow-2xl transition transform hover:-translate-y-1"
        style={{
          background: "var(--bg-container)",
          borderColor: "var(--border)",
          color: "var(--text)"
        }}
      >
        <h3
          className="text-2xl font-bold mb-6 border-b pb-2"
          style={{ color: "var(--text)", borderColor: "var(--border)" }}
        >
          📌 About DevX360
        </h3>
        <p className="mb-6 text-lg leading-relaxed max-w-3xl" style={{ color: "var(--text-light)" }}>
          DevX360 is your all-in-one platform designed for modern engineering teams. With our tools, you can:
        </p>
        <ul className="space-y-3 text-lg font-medium">
          {[
            "Track DORA metrics in real time",
            "Gain AI-powered insights",
            "Access team & individual analytics",
            "Automate reporting",
            "Integrate with GitHub & dev tools"
          ].map((item, i) => (
            <li key={i} className="flex items-center space-x-2">
              <span style={{ color: "var(--primary)" }}>✔</span>
              <span style={{ color: "var(--text-light)" }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="🚀 Deployment Frequency" value="--" trend="+12% from last week" trendType="up" />
        <StatCard title="⏱ Lead Time" value="--" trend="-8% from last week" trendType="down" />
        <StatCard title="⚠ Change Fail Rate" value="--" trend="+3% from last week" trendType="up" />
        <StatCard title="🛠 MTTR" value="--" trend="-15% from last week" trendType="down" />
      </div>
    </div>
  );
}

export default Overview;
