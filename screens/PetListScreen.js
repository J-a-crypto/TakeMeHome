import { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Modal,
    TextInput,
    ScrollView,
    Pressable,
} from 'react-native';
import { PetsContext } from '../context/PetContext';
import Header from '../components/Header';

export default function PetListScreen({ navigation }) {
    const { state, dispatch } = useContext(PetsContext);
    const [showNamingModal, setShowNamingModal] = useState(false);
    const [petName, setPetName] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);

    // Show adoption modal if pending
    useEffect(() => {
        if (state.pendingAdoption) setShowNamingModal(true);
    }, [state.pendingAdoption]);

    // Countdown in hours and minutes
    useEffect(() => {
        if (!state.nextRandomPetSpawn) return setTimeLeft(null);

        const update = () => {
            const msLeft = Math.max(0, state.nextRandomPetSpawn - Date.now());

            const totalMinutes = Math.floor(msLeft / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            setTimeLeft({ hours, minutes });
        };

        update();
        const i = setInterval(update, 1000);
        return () => clearInterval(i);
    }, [state.nextRandomPetSpawn]);

    const handleAdopt = () => {
        if (!petName) return alert('Please enter a name!');
        dispatch({ type: 'ADOPT_PET', payload: { name: petName } });
        setPetName('');
        setShowNamingModal(false);
    };

    const getRarityColor = species => {
        if (species === 'Pengu') return '#a855f7';
        if (species === 'Capybara') return '#22c55e';
        return '#ff6f61';
    };

    return (
        <View style={styles.container}>
            <Header title="🐾 Your Pets" onBack={() => navigation.navigate('Home')} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Countdown Card */}
                {timeLeft && (
                    <View style={styles.countdownCard}>
                        <Text style={styles.countdownTitle}>⏳ Next Visitor</Text>
                        <Text style={styles.countdownNumber}>
                            {String(timeLeft.hours).padStart(2, '0')}h{' '}
                            {String(timeLeft.minutes).padStart(2, '0')}m
                        </Text>
                    </View>
                )}

                {state.pets.length === 0 ? (
                    <Text style={styles.emptyText}>
                        You don’t have any pets yet 🥺
                    </Text>
                ) : (
                    state.pets.map(pet => {
                        const glow = getRarityColor(pet.species);

                        return (
                            <Pressable
                                key={pet.id}
                                onPress={() =>
                                    navigation.navigate('PetHome', { petId: pet.id })
                                }
                                style={({ pressed }) => [
                                    styles.petCardWrapper,
                                    { transform: [{ scale: pressed ? 0.96 : 1 }] },
                                ]}
                            >
                                {/* Glow Layer */}
                                <View
                                    style={[
                                        styles.glow,
                                        { backgroundColor: glow },
                                    ]}
                                />

                                {/* Card */}
                                <View style={styles.petCard}>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>✨ Cute</Text>
                                    </View>

                                    <Image
                                        source={pet.image}
                                        style={styles.petImage}
                                    />

                                    <Text style={styles.petName}>{pet.name}</Text>
                                    <Text style={styles.petSpecies}>
                                        the {pet.species}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })
                )}
            </ScrollView>

            {/* Adoption Modal */}
            {state.pendingAdoption && showNamingModal && (
                <Modal transparent animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                🎉 Meet your new {state.pendingAdoption.species}!
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={petName}
                                onChangeText={setPetName}
                                placeholder="Pet Name"
                            />

                            <Pressable
                                onPress={handleAdopt}
                                style={({ pressed }) => [
                                    styles.adoptButton,
                                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                                ]}
                            >
                                <Text style={styles.adoptButtonText}>🐾 Adopt Pet</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff3e6',
    },

    scrollContent: {
        alignItems: 'center',
        paddingBottom: 40,
    },

    countdownCard: {
        backgroundColor: '#ffe0b2',
        width: '90%',
        padding: 16,
        borderRadius: 20,
        marginVertical: 14,
        alignItems: 'center',
    },

    countdownTitle: {
        fontSize: 18,
        fontWeight: '700',
    },

    countdownNumber: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: 4,
    },

    petCardWrapper: {
        width: '90%',
        marginVertical: 14,
    },

    glow: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 30,
        opacity: 0.35,
        // blur effect in RN
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },

    petCard: {
        backgroundColor: '#ff6f61',
        borderRadius: 30,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },

    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },

    petImage: {
        width: 180,
        height: 180,
        resizeMode: 'contain',
    },

    petName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
        marginTop: 8,
    },

    petSpecies: {
        fontSize: 14,
        color: '#ffecec',
    },

    emptyText: {
        marginTop: 40,
        fontSize: 16,
        color: '#777',
    },

    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContent: {
        backgroundColor: '#fff',
        padding: 26,
        borderRadius: 20,
        width: '80%',
        alignItems: 'center',
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },

    input: {
        borderWidth: 1,
        width: '100%',
        padding: 12,
        marginVertical: 12,
        borderRadius: 10,
    },

    adoptButton: {
        backgroundColor: '#ff8c42',
        paddingVertical: 14,
        paddingHorizontal: 36,
        borderRadius: 30,
        marginTop: 10,
    },

    adoptButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
});
