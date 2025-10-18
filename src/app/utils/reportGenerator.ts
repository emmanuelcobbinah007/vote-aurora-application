import { IndividualElectionAnalytics } from "@/app/components/ui/superadmin/analytics/individual/individualElectionTypes";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface ReportOptions {
  includeScreenshot?: boolean;
  includeDetailedData?: boolean;
  format?: "pdf" | "json" | "csv";
}

export const generateElectionReport = async (
  analyticsData: IndividualElectionAnalytics,
  options: ReportOptions = {}
): Promise<void> => {
  const {
    includeScreenshot = true,
    includeDetailedData = true,
    format = "pdf",
  } = options;

  const election = analyticsData.election;
  const metrics = analyticsData.metrics;

  switch (format) {
    case "pdf":
      await generatePDFReport(
        analyticsData,
        includeScreenshot,
        includeDetailedData
      );
      break;
    case "json":
      generateJSONReport(analyticsData);
      break;
    case "csv":
      generateCSVReport(analyticsData);
      break;
    default:
      await generatePDFReport(
        analyticsData,
        includeScreenshot,
        includeDetailedData
      );
  }
};

const generatePDFReport = async (
  analyticsData: IndividualElectionAnalytics,
  includeScreenshot: boolean,
  includeDetailedData: boolean
): Promise<void> => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("Election Analytics Report", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 15;

  // Election Details
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Election Information", 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  const electionDetails = [
    `Title: ${analyticsData.election.title}`,
    `Status: ${analyticsData.election.status}`,
    `Type: ${analyticsData.election.isGeneral ? "General" : "Departmental"}`,
    `Department: ${analyticsData.election.department || "All Departments"}`,
    `Start Time: ${new Date(
      analyticsData.election.startTime
    ).toLocaleString()}`,
    `End Time: ${new Date(analyticsData.election.endTime).toLocaleString()}`,
    `Created: ${new Date(analyticsData.election.createdAt).toLocaleString()}`,
  ];

  electionDetails.forEach((detail) => {
    pdf.text(detail, 20, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  // Key Metrics
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Key Metrics", 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  const metrics = [
    `Total Votes Cast: ${analyticsData.metrics.totalVotes.toLocaleString()}`,
    `Eligible Voters: ${analyticsData.metrics.totalEligibleVoters.toLocaleString()}`,
    `Voter Turnout: ${analyticsData.metrics.turnoutPercentage.toFixed(1)}%`,
    `Voting Efficiency: ${analyticsData.metrics.votingEfficiency.toFixed(1)}%`,
    `Active Tokens: ${analyticsData.metrics.usedTokens.toLocaleString()}`,
    `Portfolios: ${analyticsData.metrics.portfoliosCount}`,
    `Candidates: ${analyticsData.metrics.candidatesCount}`,
    `Assigned Admins: ${analyticsData.metrics.assignedAdminsCount}`,
  ];

  metrics.forEach((metric) => {
    pdf.text(metric, 20, yPosition);
    yPosition += 7;
  });

  // Check if we need a new page
  if (yPosition > pageHeight - 40) {
    pdf.addPage();
    yPosition = 20;
  }

  // Candidate Performance
  if (includeDetailedData && analyticsData.candidatePerformance.length > 0) {
    yPosition += 10;
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Candidate Performance", 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");

    analyticsData.candidatePerformance.forEach((candidate, index) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }

      const rank = index + 1;
      pdf.text(`${rank}. ${candidate.candidateName}`, 20, yPosition);
      pdf.text(`Portfolio: ${candidate.portfolioTitle}`, 30, yPosition + 5);
      pdf.text(
        `Votes: ${candidate.votes.toLocaleString()} (${candidate.percentage.toFixed(
          1
        )}%)`,
        30,
        yPosition + 10
      );
      yPosition += 18;
    });
  }

  // Portfolio Analysis
  if (includeDetailedData && analyticsData.portfolioDistribution.length > 0) {
    yPosition += 10;
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Portfolio Analysis", 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");

    analyticsData.portfolioDistribution.forEach((portfolio: any) => {
      if (yPosition > pageHeight - 25) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.text(`${portfolio.portfolioTitle}`, 20, yPosition);
      pdf.text(
        `Candidates: ${
          portfolio.candidatesCount
        } | Votes: ${portfolio.votes.toLocaleString()}`,
        30,
        yPosition + 5
      );
      pdf.text(
        `Vote Share: ${portfolio.percentage.toFixed(1)}%`,
        30,
        yPosition + 10
      );
      yPosition += 18;
    });
  }

  // Screenshot
  if (includeScreenshot) {
    try {
      const analyticsContainer = document.querySelector(
        "[data-analytics-container]"
      ) as HTMLElement;
      if (analyticsContainer) {
        pdf.addPage();

        const canvas = await html2canvas(analyticsContainer, {
          scale: 0.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.text("Analytics Dashboard Screenshot", pageWidth / 2, 20, {
          align: "center",
        });
        pdf.addImage(
          imgData,
          "PNG",
          10,
          30,
          imgWidth,
          Math.min(imgHeight, pageHeight - 40)
        );
      }
    } catch (error) {
      console.warn("Could not capture screenshot for report:", error);
    }
  }

  // Footer
  const timestamp = new Date().toLocaleString();
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "italic");
  pdf.text(`Generated on ${timestamp}`, pageWidth / 2, pageHeight - 10, {
    align: "center",
  });

  // Save the PDF
  const fileName = `election-analytics-${analyticsData.election.title.replace(
    /[^a-zA-Z0-9]/g,
    "-"
  )}-${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(fileName);
};

const generateJSONReport = (
  analyticsData: IndividualElectionAnalytics
): void => {
  const reportData = {
    ...analyticsData,
    generatedAt: new Date().toISOString(),
    reportType: "individual-election-analytics",
  };

  const dataStr = JSON.stringify(reportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = `election-analytics-${analyticsData.election.title.replace(
    /[^a-zA-Z0-9]/g,
    "-"
  )}-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
};

const generateCSVReport = (
  analyticsData: IndividualElectionAnalytics
): void => {
  const csvData = [
    // Header
    ["Election Analytics Report"],
    ["Generated on", new Date().toLocaleString()],
    [""],
    ["Election Information"],
    ["Title", analyticsData.election.title],
    ["Status", analyticsData.election.status],
    ["Type", analyticsData.election.isGeneral ? "General" : "Departmental"],
    ["Department", analyticsData.election.department || "All Departments"],
    ["Start Time", new Date(analyticsData.election.startTime).toLocaleString()],
    ["End Time", new Date(analyticsData.election.endTime).toLocaleString()],
    [""],
    ["Key Metrics"],
    ["Total Votes Cast", analyticsData.metrics.totalVotes],
    ["Eligible Voters", analyticsData.metrics.totalEligibleVoters],
    ["Voter Turnout (%)", analyticsData.metrics.turnoutPercentage.toFixed(1)],
    [
      "Voting Efficiency (%)",
      analyticsData.metrics.votingEfficiency.toFixed(1),
    ],
    ["Active Tokens", analyticsData.metrics.usedTokens],
    ["Portfolios", analyticsData.metrics.portfoliosCount],
    ["Candidates", analyticsData.metrics.candidatesCount],
    ["Assigned Admins", analyticsData.metrics.assignedAdminsCount],
    [""],
    ["Candidate Performance"],
    ["Rank", "Name", "Portfolio", "Votes", "Percentage"],
    ...analyticsData.candidatePerformance.map((candidate, index) => [
      index + 1,
      candidate.candidateName,
      candidate.portfolioTitle,
      candidate.votes,
      candidate.percentage.toFixed(1) + "%",
    ]),
    [""],
    ["Portfolio Analysis"],
    ["Portfolio", "Candidates", "Total Votes", "Percentage"],
    ...analyticsData.portfolioDistribution.map((portfolio: any) => [
      portfolio.portfolioTitle,
      portfolio.candidatesCount,
      portfolio.votes,
      portfolio.percentage.toFixed(1) + "%",
    ]),
  ];

  const csvContent = csvData
    .map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `election-analytics-${analyticsData.election.title.replace(
    /[^a-zA-Z0-9]/g,
    "-"
  )}-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};
