/**
 * Privacy policy copy ({company}/{email} are interpolated by the page)
 */
export default {
  title: "Privacy policy",
  meta: {
    version: "Version",
    updateDate: "Updated",
    effectiveDate: "Effective"
  },
  intro:
    '{company} ("we") takes your privacy and data security seriously. This policy explains what information we collect, and how we use, store and protect it. Read it before using the system; using the system means you understand and accept it.',
  sections: [
    {
      id: "section1",
      title: "1. Introduction and scope",
      paragraphs: [
        "This policy covers personal information and device data handled while you use the system and its connected equipment.",
        "We process that data in line with the Data Security Law and the Personal Information Protection Law of the People's Republic of China, and with multi-level protection requirements for cybersecurity.",
        "The system is general-purpose information management software and does not replace professional judgement. Decisions in regulated industries must follow the applicable rules."
      ]
    },
    {
      id: "section2",
      title: "2. What we collect",
      paragraphs: [
        "Account information: the account name, contact details and similar data supplied at registration and sign-in.",
        "Device data: model, serial number, running state, alarms and maintenance records of connected equipment, used for management and service.",
        "Log data: access logs such as operation time and feature usage, used for security auditing and troubleshooting.",
        "Minimal necessary principle: information is processed only as far as needed for the purposes above, never beyond the service."
      ]
    },
    {
      id: "section3",
      title: "3. How we use it",
      paragraphs: [
        "Information is used for device monitoring, maintenance reminders, fault diagnosis, service quality improvement and security auditing.",
        "Without your consent we do not use it for purposes not described in this policy."
      ]
    },
    {
      id: "section4",
      title: "4. Storage and protection",
      paragraphs: [
        "Information is stored in a data environment that meets security standards, with access control, encrypted transport and other measures against unauthorised access, disclosure and tampering.",
        "Deployment: the system can run in a local environment you designate, such as a hospital intranet. In that mode device data stays on your own servers and does not leave your network.",
        "Device data is retained for the period agreed by both parties, then deleted or anonymised under security procedures."
      ]
    },
    {
      id: "section5",
      title: "5. Sharing and disclosure",
      paragraphs: [
        "We do not share your information with third parties except where required by law, requested by a judicial or administrative authority, or expressly authorised by you.",
        "Where a third party provides technical services, a contract obliges it to protect your information to the same standard."
      ]
    },
    {
      id: "section6",
      title: "6. Your rights",
      paragraphs: [
        "You may access, correct, supplement or delete your information, and may apply through the contact below.",
        "We handle and answer requests within a reasonable period."
      ]
    },
    {
      id: "section7",
      title: "7. Sensitive data",
      paragraphs: [
        "The system does not actively collect sensitive information tied to personal identity; business data covers equipment parameters only.",
        "If a business need ever involves sensitive data, we ask for your separate consent and apply stricter protection."
      ]
    },
    {
      id: "section8",
      title: "8. Policy updates",
      paragraphs: [
        "We may update this policy from time to time and publish the change in the system; material changes are announced prominently.",
        "Continued use of the system means you accept the updated policy."
      ]
    },
    {
      id: "section9",
      title: "9. Data ownership and exit",
      paragraphs: [
        "Equipment data belongs to you or your customer. We process it only as the service provider, and once the contract is fully paid the data belongs to you.",
        "When the service ends or equipment is removed you may request an export; we cooperate within a reasonable period and then delete or hand over the data as agreed."
      ]
    },
    {
      id: "section10",
      title: "10. Contact",
      paragraphs: [
        "Questions, comments or complaints about this policy: {email}.",
        "We respond promptly once your message arrives."
      ]
    }
  ]
};
