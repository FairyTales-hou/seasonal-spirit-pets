import { computed } from 'vue'
import { useHomeStore } from '@/store/home'
import { PETS } from '@/mock/pets'
import { KNOWLEDGE_CARDS, DETAILED_SUGGESTIONS, INTERACTION_FEEDBACK, MINE_ACTIONS } from '@/mock/home'

export function useHome() {
  const homeStore = useHomeStore()

  const homeData = computed(() => homeStore.homeData)
  const favoritePetIds = computed(() => homeStore.favoritePetIds)
  const getPetById = (petId?: string) => PETS.find((pet) => pet.id === petId)
  const currentPet = computed(() => getPetById(homeData.value.petId) ?? PETS[0])
  const unlockedPets = computed(() => PETS.filter((pet) => pet.unlocked || pet.id === homeData.value.petId))
  const favoritePets = computed(() => PETS.filter((pet) => favoritePetIds.value.includes(pet.id)))
  const isFavoritePet = (petId: string) => homeStore.isFavoritePet(petId)

  return {
    homeData,
    favoritePetIds,
    favoritePets,
    currentPet,
    getPetById,
    isFavoritePet,
    pets: PETS,
    unlockedPets,
    detailedSuggestions: DETAILED_SUGGESTIONS,
    knowledgeCards: KNOWLEDGE_CARDS,
    interactionFeedback: INTERACTION_FEEDBACK,
    mineActions: MINE_ACTIONS,
    interact: homeStore.interact,
    toggleFavoritePet: homeStore.toggleFavoritePet,
  }
}
