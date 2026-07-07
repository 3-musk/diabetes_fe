import { Image, StyleSheet, View } from 'react-native';
import { borderRadius, colors, fontSize, spacing } from '../../theme';
import { AppModal } from '../ui/AppModal';
import AppText from '../ui/AppText';

type GlucoseCriticalModalProps = {
  visible: boolean;
  escalationText: string;
  onClose: () => void;
};

export function GlucoseCriticalModal({
  visible,
  escalationText,
  onClose,
}: GlucoseCriticalModalProps) {
  if (!visible) return null;

  return (
    <AppModal visible={visible} onClose={onClose} cardStyle={styles.card} maxHeight={'70%'} containerStyle={{marginTop:'90%'}}>
      <View style={styles.container}>
        <Image
          source={require('../../../assets/images/doctor_team.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <AppText variant='semibold' style={styles.messageText}>
          {escalationText || "Your glucose level is not normal. Please visit nearest hospital or consult a doctor immediately."}
        </AppText>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  container: {
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 150,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  messageText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
});
