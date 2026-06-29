import { Navigate, Route, Routes } from 'react-router';

import { DeviceGate } from '../layouts/DeviceGate';
import { HomePage } from '../page/HomePage/HomePage';
import { SplashScreen } from '../page/SplashScreen/SplashScreen';

export function AppRoutes() {
	return (
		<Routes>
			<Route
				path="/"
				element={
					<DeviceGate>
						<SplashScreen />
					</DeviceGate>
				}
			/>

			<Route
				path="/inicio"
				element={
					<DeviceGate>
						<HomePage />
					</DeviceGate>
				}
			/>

			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}