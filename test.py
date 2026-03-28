import cv2
import inference
import supervision as sv
import os

# --- CONFIGURATION ---
API_KEY = "rf_douBdVkunVYHzAvTpOYapKH2ch52" # <--- Mets ta clé ici
MODEL_ID = "bee_detection-9mugi/31"

def main():
    # 1. Demander le fichier à l'utilisateur
    print("--- BEE MONITORING TEST TOOL ---")
    path = input("Entrez le chemin de la photo ou vidéo : ").strip('"')
    
    if not os.path.exists(path):
        print("Erreur : Fichier introuvable.")
        return

    # 2. Charger le modèle
    model = inference.get_model(model_id=MODEL_ID, api_key=API_KEY)
    
    # Préparer les outils de dessin
    box_annotator = sv.BoxAnnotator()
    label_annotator = sv.LabelAnnotator()

    # 3. Traitement
    # Si c'est une image
    if path.lower().endswith(('.png', '.jpg', '.jpeg')):
        frame = cv2.imread(path)
        results = model.infer(frame)[0]
        detections = sv.Detections.from_inference(results)
        
        # Comptage
        count = len(detections)
        
        # Annotation
        annotated_frame = box_annotator.annotate(scene=frame, detections=detections)
        annotated_frame = label_annotator.annotate(scene=annotated_frame, detections=detections)
        
        # Affichage du score total
        cv2.putText(annotated_frame, f"Abeilles detectees: {count}", (50, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 3)
        
        cv2.imshow("Detection Abeilles", annotated_frame)
        cv2.waitKey(0)

    # Si c'est une vidéo
    else:
        cap = cv2.VideoCapture(path)
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            
            results = model.infer(frame)[0]
            detections = sv.Detections.from_inference(results)
            count = len(detections)

            annotated_frame = box_annotator.annotate(scene=frame, detections=detections)
            
            # Bandeau de comptage en bas
            cv2.rectangle(annotated_frame, (0, annotated_frame.shape[0]-50), 
                          (300, annotated_frame.shape[0]), (0,0,0), -1)
            cv2.putText(annotated_frame, f"ABEILLES : {count}", (20, annotated_frame.shape[0]-15), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

            cv2.imshow("Beemonitor Live Count", annotated_frame)
            if cv2.waitKey(1) & 0xFF == ord('q'): break
            
        cap.release()
    
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()