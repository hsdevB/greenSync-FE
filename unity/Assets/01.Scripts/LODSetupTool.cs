using System.Linq;
using UnityEngine;

public class LODSetupTool : MonoBehaviour
{
    public GameObject[] tomatoGroups;

    public void ApplyLOD()
    {
        foreach (GameObject group in tomatoGroups)
        {
            // ���� LODGroup ����
            var existing = group.GetComponent<LODGroup>();
            if (existing) DestroyImmediate(existing);

            // CustomLODController �߰�
            var controller = group.GetComponent<CustomLODController>();
            if (controller == null)
                controller = group.AddComponent<CustomLODController>();

            // LOD GameObject�� ������ ����
            GameObject lod0 = FindOrCreateLODChild(group, "LOD0");
            GameObject lod1 = FindOrCreateLODChild(group, "LOD1");
            GameObject lod2 = FindOrCreateLODChild(group, "LOD2");

            // ��� Renderer ��������
            var renderers = group.GetComponentsInChildren<Renderer>(true);

            foreach (var r in renderers)
            {
                string name = r.name.ToLower();

                if (name.Contains("leaf"))        // �� �� LOD0��
                    r.transform.SetParent(lod0.transform);
                else if (name.Contains("pcube1")) // �ٱ� �� LOD0, LOD1
                {
                    r.transform.SetParent(lod0.transform);
                    r.transform.SetParent(lod1.transform); // ����: ���� ���� �ʿ�
                }
                else if (name.Contains("tomato")) // �丶�� �� LOD0, LOD1, LOD2
                {
                    r.transform.SetParent(lod0.transform);
                    r.transform.SetParent(lod1.transform);
                    r.transform.SetParent(lod2.transform);
                }
            }

            // ����
            controller.LOD0 = lod0;
            controller.LOD1 = lod1;
            controller.LOD2 = lod2;
            controller.LOD3 = null; // ���� ���
        }
    }

    private GameObject FindOrCreateLODChild(GameObject parent, string name)
    {
        Transform existing = parent.transform.Find(name);
        if (existing != null)
            return existing.gameObject;

        GameObject child = new GameObject(name);
        child.transform.SetParent(parent.transform);
        child.transform.localPosition = Vector3.zero;
        return child;
    }

    //public void ApplyLOD()
    //{
    //    foreach (GameObject group in tomatoGroups)
    //    {
    //        // ���� LODGroup�� ������ ����
    //        var existing = group.GetComponent<LODGroup>();
    //        if (existing) DestroyImmediate(existing);

    //        var lodGroup = group.AddComponent<LODGroup>();

    //        // �̸����� ���� ������ ã��
    //        var tomatoRenderers = group.GetComponentsInChildren<Renderer>()
    //                                   .Where(r => r.name.ToLower().Contains("tomato")).ToArray();
    //        var stemRenderers = group.GetComponentsInChildren<Renderer>()
    //                                 .Where(r => r.name.ToLower().Contains("pCube1")).ToArray();
    //        var leafRenderers = group.GetComponentsInChildren<Renderer>()
    //                                 .Where(r => r.name.ToLower().Contains("leaf")).ToArray();

    //        // LOD ����
    //        LOD[] lods = new LOD[3];
    //        lods[0] = new LOD(0.99f, tomatoRenderers.Concat(stemRenderers).Concat(leafRenderers).ToArray());
    //        lods[1] = new LOD(0.95f, tomatoRenderers.Concat(stemRenderers).ToArray());
    //        lods[2] = new LOD(0.9f, tomatoRenderers);

    //        lodGroup.SetLODs(lods);
    //        lodGroup.RecalculateBounds(); // ī�޶���� �Ÿ� ��� ����� �ϱ� ����
    //    }
    //}

    //public void Controller()
    //{
    //    Camera mainCam = Camera.main;

    //    foreach (GameObject group in tomatoGroups)
    //    {
    //        if (group == null) continue;

    //        var controller = group.GetComponent<CustomLODController>();
    //        if (controller == null)
    //            controller = group.AddComponent<CustomLODController>();

    //        controller.LOD0 = FindChild(group, "LOD0");
    //        controller.LOD1 = FindChild(group, "LOD1");
    //        controller.LOD2 = FindChild(group, "LOD2");
    //        controller.LOD3 = FindChild(group, "LOD3");
    //    }
    //}

    //GameObject FindChild(GameObject parent, string name)
    //{
    //    Transform[] children = parent.GetComponentsInChildren<Transform>(true);
    //    foreach (var child in children)
    //    {
    //        if (child.name == name)
    //            return child.gameObject;
    //    }
    //    Debug.LogWarning($"'{name}' �̸��� �ڽ� ������Ʈ�� ã�� �� �����ϴ�. ({parent.name})");
    //    return null;
    //}
}
