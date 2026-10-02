export const site = {
  name: "Sejal Agarwal",
  intro:
    "Hi, I'm a Software & UI/UX engineer who turns complex workflows into delightful interfaces. Currently growing ideas in HCI research at the University of Waterloo 🌱",
  currently: "Currently: Research Intern @ Autodesk",
  resumeHref: "/Sejal_Resume.pdf",
  links: {
    github: "https://github.com/sejal-agarwal",
    linkedin: "https://linkedin.com/in/sejal-agarwal21",
    email: "mailto:sejalagarwal321@gmail.com",
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Research", href: "#research" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];
