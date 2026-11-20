/**
 * Terms of service copy ({company}/{email} are interpolated by the page)
 */
export default {
  title: "Terms of service",
  meta: {
    version: "Version",
    updateDate: "Updated",
    effectiveDate: "Effective"
  },
  intro:
    'Welcome to the software system provided by {company}. Please read these terms of service ("the Terms") carefully before using it. By using the system you confirm that you have read, understood and accepted all of the Terms.',
  sections: [
    {
      id: "section1",
      title: "1. The service",
      paragraphs: [
        "The system is developed and maintained by {company} for internal information management, covering account permissions, business data and operation records.",
        "The exact scope, modules and deliverables are defined by the commercial contract signed by both parties."
      ]
    },
    {
      id: "section2",
      title: "2. Accounts and security",
      paragraphs: [
        "You agree to provide true, accurate and complete registration details and to safeguard the account name, password and related credentials.",
        "You are responsible for all activity under the account and may not lend, transfer or share it with others. Report any anomaly immediately."
      ]
    },
    {
      id: "section3",
      title: "3. Licence",
      paragraphs: [
        "Subject to the Terms, we grant a non-exclusive, non-transferable, non-sublicensable licence limited to the number of authorised accounts or deployed instances set out in the commercial contract.",
        "Without written consent you may not move the licence to unauthorised accounts or instances, and may not copy, modify, decompile or reverse engineer any part of the system.",
        "The licence term follows the contract and ends automatically when the contract expires or is terminated."
      ]
    },
    {
      id: "section4",
      title: "4. Data and privacy",
      paragraphs: [
        "Data handled by the system covers account information, basic device information and operation data, used only for management and maintenance.",
        "Collection, use, storage and protection of that data follow the Privacy policy; please read it for details."
      ]
    },
    {
      id: "section5",
      title: "5. Support",
      paragraphs: [
        "We provide deployment, upgrade and remote technical support. Specific services and response times follow the signed commercial contract.",
        "Incidents caused by the operating environment or third parties are handled under the service terms agreed by both parties."
      ]
    },
    {
      id: "section6",
      title: "6. Intellectual property",
      paragraphs: [
        "Intellectual property in the system, its documents, interface, icons and code belongs to {company} and is protected by copyright, trademark and other laws.",
        "No rights are granted beyond those expressly stated in the Terms."
      ]
    },
    {
      id: "section7",
      title: "7. Disclaimer and limitation of liability",
      paragraphs: [
        "The system is general-purpose information management software and does not grant any industry licence or qualification. Judgements and operations in regulated business must follow applicable regulations and authority requirements.",
        "Data and status shown by the system are for operational reference only and are not professional advice. Decisions in regulated business must follow the relevant rules.",
        "To the fullest extent permitted by law we are not liable for outages or data loss caused by force majeure, network failures, attacks or other causes outside our control.",
        "Loss caused by using the system contrary to instructions, by unauthorised configuration changes or by third parties is borne by the responsible party.",
        "In on-premise deployments you are responsible for information security in your own network, including access control and vulnerability protection. Data loss caused by insufficient protection in your environment is your responsibility."
      ]
    },
    {
      id: "section8",
      title: "8. Changes and termination",
      paragraphs: [
        "We may update the Terms from time to time. Ordinary changes are published in the system and take effect on publication; material changes affecting your rights take effect 30 days after prominent notice.",
        "If you breach the Terms and do not remedy it within the stated period, we may suspend or terminate the service and reserve the right to pursue legal remedies."
      ]
    },
    {
      id: "section9",
      title: "9. Effective date, governing law and contact",
      paragraphs: [
        "The Terms take effect when the contract is signed; the service term and licence period follow that contract.",
        "The Terms are governed by the laws of the People's Republic of China. Disputes are settled by negotiation; failing that, by litigation in the competent court where we are located.",
        "Questions about the Terms: {email}."
      ]
    }
  ]
};
