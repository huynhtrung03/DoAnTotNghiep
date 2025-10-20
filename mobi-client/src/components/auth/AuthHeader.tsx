import { View, Text, StyleSheet } from 'react-native';

export default function AuthHeader() {
	return (
		<View style={styles.container}>
			<View style={styles.logoContainer}>
				<View style={styles.logoCircle}>
					<Text style={styles.logoText}>A</Text>
				</View>
			</View>
			<Text style={styles.title}>Welcome to Ants</Text>
			<Text style={styles.subtitle}>Find your perfect home</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		marginBottom: 24,
	},
	logoContainer: {
		marginBottom: 16,
	},
	logoCircle: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: 'rgba(255,255,255,0.9)',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	logoText: {
		fontSize: 28,
		fontWeight: '800',
		color: '#f97316',
	},
	title: {
		fontSize: 28,
		fontWeight: '800',
		color: '#111827',
		marginBottom: 4,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#6b7280',
		textAlign: 'center',
		fontWeight: '500',
	},
});