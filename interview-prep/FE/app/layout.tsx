import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'Interview Analyzer',
	description: 'Interview Analyzer',
	generator: 'Interview Analyzer',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
