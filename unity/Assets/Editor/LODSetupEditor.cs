using UnityEditor;
using UnityEngine;

public class LODSetupEditor : EditorWindow
{
    public GameObject[] tomatoGroups;
    private Vector2 scrollPos;

    [MenuItem("Tools/LOD Setup Tool")]
    public static void ShowWindow()
    {
        GetWindow<LODSetupEditor>("LOD Setup Tool");
    }

    private void OnGUI() // Editor 툴 GUI 만드는 과정
    {
        SerializedObject so = new SerializedObject(this);
        SerializedProperty groupsProp = so.FindProperty("tomatoGroups");

        scrollPos = EditorGUILayout.BeginScrollView(scrollPos); // 스크롤 시작

        EditorGUILayout.PropertyField(groupsProp, new GUIContent("Tomato Groups"), true);

        if (GUILayout.Button("Apply LOD Setup & Controller"))
        {
            foreach (GameObject group in tomatoGroups)
            {
                var setupTool = new GameObject("TempLODSetter").AddComponent<LODSetupTool>();
                setupTool.tomatoGroups = new GameObject[] { group };
                setupTool.ApplyLOD();
                //setupTool.Controller();
                DestroyImmediate(setupTool.gameObject);
            }
            Debug.Log("LOD 적용 완료");
        }

        if (GUILayout.Button("Set Fade Mode to CrossFade"))
        {
            foreach (GameObject obj in tomatoGroups)
            {
                LODGroup lodGroup = obj.GetComponent<LODGroup>();
                if (lodGroup == null) continue;

                // 각 LOD의 fadeTransitionWidth도 설정
                var lods = lodGroup.GetLODs();
                for (int i = 0; i < lods.Length; i++)
                {
                    lods[i].fadeTransitionWidth = 0.3f; // 예시 값 (0~1)
                }

                lodGroup.fadeMode = LODFadeMode.CrossFade;
                lodGroup.animateCrossFading = true;
                lodGroup.SetLODs(lods);
                lodGroup.RecalculateBounds();
            }
        }
        EditorGUILayout.EndScrollView(); // 스크롤 종료
        so.ApplyModifiedProperties();
    }
}
