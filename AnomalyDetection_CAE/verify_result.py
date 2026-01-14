import re

def parse_result(file_path):
    try:
        with open(file_path, 'r', encoding='utf-16') as f:
            content = f.read()
    except:
        with open(file_path, 'r', encoding='utf-8') as f: # fallback
            content = f.read()

    lines = content.splitlines()
    crack_total = 0
    crack_detected = 0
    good_total = 0
    good_false_positive = 0
    
    missed_cracks = []
    false_positives = []

    print("-" * 60)
    print(f"{'Category':<10} | {'File':<10} | {'Score':<8} | {'AR':<6} | {'Status'}")
    print("-" * 60)

    for line in lines:
        if "crack" in line or "good" in line:
            parts = line.split('|')
            if len(parts) >= 5:
                category = parts[0].strip()
                filename = parts[1].strip()
                score = parts[2].strip()
                ar = parts[3].strip()
                status = parts[4].strip()
                
                if category == 'crack':
                    crack_total += 1
                    if status == 'Defect':
                        crack_detected += 1
                        print(f"{category:<10} | {filename:<10} | {score:<8} | {ar:<6} | {status}")
                    else:
                        missed_cracks.append(f"{filename} (Score:{score}, AR:{ar})")
                elif category == 'good':
                    good_total += 1
                    if status == 'Defect':
                        good_false_positive += 1
                        false_positives.append(f"{filename} (Score:{score}, AR:{ar})")
                        print(f"{category:<10} | {filename:<10} | {score:<8} | {ar:<6} | {status}")

    print("-" * 60)
    print(f"Crack Detection Rate: {crack_detected}/{crack_total} ({crack_detected/crack_total*100:.1f}%)")
    print(f"Good False Positive Ratio: {good_false_positive}/{good_total} ({good_false_positive/good_total*100:.1f}%)")
    
    if missed_cracks:
        print("\n[Missed Cracks]")
        for item in missed_cracks:
            print(f"- {item}")
            
    if false_positives:
        print("\n[False Positives (Good -> Defect)]")
        for item in false_positives:
            print(f"- {item}")

if __name__ == "__main__":
    parse_result("result_final_v2.txt")
