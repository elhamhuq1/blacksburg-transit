/**
 * Alerts Tab Screen
 * Shows active service alerts
 */

import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlerts } from '../../lib/hooks/useAlerts';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Colors } from '../../constants/Colors';

export default function AlertsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: alerts, isLoading, isError, error, refetch, isRefetching } = useAlerts();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
      default:
        return colors.primary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Service Alerts</Text>
      </View>

      {/* Loading state */}
      {isLoading && (
        <ScrollView style={styles.scrollView}>
          <LoadingSkeleton width="90%" height={100} style={styles.skeleton} />
          <LoadingSkeleton width="90%" height={100} style={styles.skeleton} />
        </ScrollView>
      )}

      {/* Error state */}
      {isError && (
        <EmptyState
          icon="⚠️"
          title="Unable to load alerts"
          subtitle={error?.message || 'Please try again later'}
        />
      )}

      {/* Alerts list */}
      {!isLoading && !isError && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {alerts && alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <View
                key={`${alert.id}-${index}`}
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: colors.surface,
                    borderLeftColor: getSeverityColor(alert.severity),
                  },
                ]}
                accessibilityRole="text"
              >
                <View style={styles.alertHeader}>
                  <Text style={styles.severityIcon}>{getSeverityIcon(alert.severity)}</Text>
                  <Text
                    style={[styles.alertTitle, { color: colors.text }]}
                    allowFontScaling
                  >
                    {alert.title}
                  </Text>
                </View>
                <Text
                  style={[styles.alertDescription, { color: colors.textSecondary }]}
                  allowFontScaling
                >
                  {alert.description}
                </Text>
                {alert.affectedRoutes && alert.affectedRoutes.length > 0 && (
                  <View style={styles.affectedContainer}>
                    <Text
                      style={[styles.affectedLabel, { color: colors.textSecondary }]}
                      allowFontScaling
                    >
                      Affected routes: {alert.affectedRoutes.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <EmptyState
              icon="✅"
              title="No active alerts"
              subtitle="All routes are operating normally"
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  skeleton: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  alertCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  severityIcon: {
    fontSize: 20,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  alertDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  affectedContainer: {
    marginTop: 4,
  },
  affectedLabel: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
